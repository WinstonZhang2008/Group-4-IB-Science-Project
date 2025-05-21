import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { optimalSoilRanges } from '@/data/soilData';
import { getAllCropRecommendations } from '@/services/soilService';
import { CropRecommendation } from '@/data/cropRecommendationDB';

// Define form schema with validation
const soilFormSchema = z.object({
  pH: z.number().min(0).max(14),
  nitrogen: z.number().min(0).max(1),
  phosphorus: z.number().min(0).max(1),
  potassium: z.number().min(0).max(1),
  moisture: z.number().min(0).max(100),
});

export type SoilFormData = z.infer<typeof soilFormSchema>;

function recommendCropsFromDB(soil: SoilFormData, db: CropRecommendation[]): { crop: string; score: number }[] {
  // Only use the 4 required features present in the CSV
  const features = [
    { user: 'nitrogen', db: 'N' },
    { user: 'phosphorus', db: 'P' },
    { user: 'potassium', db: 'K' },
    { user: 'pH', db: 'ph' },
  ];

  // Filter out rows with missing or non-numeric values
  const filteredDB = db.filter(row =>
    features.every(({ db: dbKey }) => row[dbKey] !== undefined && !isNaN(parseFloat(row[dbKey])))
  );

  // Find min/max for normalization
  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};
  features.forEach(({ db: dbKey }) => {
    mins[dbKey] = Math.min(...filteredDB.map(row => parseFloat(row[dbKey])));
    maxs[dbKey] = Math.max(...filteredDB.map(row => parseFloat(row[dbKey])));
  });

  // Normalize user input
  const normalizedUser: Record<string, number> = {};
  normalizedUser['N'] = soil.nitrogen * 100; // user input is 0-1, DB is 0-100
  normalizedUser['P'] = soil.phosphorus * 100;
  normalizedUser['K'] = soil.potassium * 100;
  normalizedUser['ph'] = soil.pH;

  features.forEach(({ db: dbKey }) => {
    if (maxs[dbKey] !== mins[dbKey]) {
      normalizedUser[dbKey] = (normalizedUser[dbKey] - mins[dbKey]) / (maxs[dbKey] - mins[dbKey]);
    } else {
      normalizedUser[dbKey] = 0.5; // fallback if all values are the same
    }
  });

  // Score each crop in the DB by distance to user input (for N, P, K, ph)
  const cropScores: Record<string, { total: number; count: number }> = {};
  filteredDB.forEach(row => {
    const rowNorm: Record<string, number> = {};
    features.forEach(({ db: dbKey }) => {
      if (maxs[dbKey] !== mins[dbKey]) {
        rowNorm[dbKey] = (parseFloat(row[dbKey]) - mins[dbKey]) / (maxs[dbKey] - mins[dbKey]);
      } else {
        rowNorm[dbKey] = 0.5;
      }
    });
    const dist = Math.sqrt(features.reduce((sum, { db: dbKey }) => sum + Math.pow(rowNorm[dbKey] - normalizedUser[dbKey], 2), 0));
    const crop = row.label;
    if (!cropScores[crop]) cropScores[crop] = { total: 0, count: 0 };
    cropScores[crop].total += dist;
    cropScores[crop].count += 1;
  });

  // Average and sort
  const ranked = Object.entries(cropScores)
    .map(([crop, { total, count }]) => ({ crop, score: count > 0 ? 1 - total / count : 0 }))
    .sort((a, b) => b.score - a.score);

  // Optionally, adjust scores based on user moisture input (not in DB)
  // For now, just attach a warning if moisture is not used
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('moistureWarning', 'true');
  }

  return ranked;
}

const SoilChecker: React.FC = () => {
  const [analyzedData, setAnalyzedData] = useState<SoilFormData | null>(null);
  const [cropDB, setCropDB] = useState<CropRecommendation[]>([]);
  const [recommendations, setRecommendations] = useState<{ crop: string; score: number }[] | null>(null);

  useEffect(() => {
    // Load the crop recommendation database on mount
    getAllCropRecommendations().then((data) => setCropDB(data as CropRecommendation[]));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SoilFormData>({
    resolver: zodResolver(soilFormSchema),
    defaultValues: {
      pH: 7,
      nitrogen: 0.5,
      phosphorus: 0.5,
      potassium: 0.5,
      moisture: 50,
    },
  });

  // Watch all form values for sliders
  const watchedValues = watch();

  // Handle slider changes
  const handleSliderChange = (name: keyof SoilFormData, value: number[]) => {
    setValue(name, value[0], { shouldValidate: true });
  };

  const onSubmit = (data: SoilFormData) => {
    setAnalyzedData(data);
    setRecommendations(recommendCropsFromDB(data, cropDB));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Soil Suitability Checker</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Enter Soil Parameters</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="mb-3">
                <Label htmlFor="pH">pH Level (average: 6.0-7.0)</Label>
                <Input type="number" step="0.1" {...register('pH', { valueAsNumber: true })} className="w-20" placeholder="Enter soil pH" />
                <p className="text-xs text-muted-foreground mt-1">Optimal range: {optimalSoilRanges.pH.min} - {optimalSoilRanges.pH.max} {optimalSoilRanges.pH.unit}</p>
                {errors.pH && <p className="text-red-500 text-xs mt-1">{errors.pH.message}</p>}
              </div>
              <div className="mb-3">
                <Label htmlFor="nitrogen">Nitrogen (0-1, e.g. 0.3)</Label>
                <Input type="number" step="0.01" {...register('nitrogen', { valueAsNumber: true })} className="w-20" placeholder="Enter nitrogen" />
                <p className="text-xs text-muted-foreground mt-1">Optimal range: {optimalSoilRanges.nitrogen.min} - {optimalSoilRanges.nitrogen.max} {optimalSoilRanges.nitrogen.unit}</p>
                {errors.nitrogen && <p className="text-red-500 text-xs mt-1">{errors.nitrogen.message}</p>}
              </div>
              <div className="mb-3">
                <Label htmlFor="phosphorus">Phosphorus (0-1, e.g. 0.2)</Label>
                <Input type="number" step="0.01" {...register('phosphorus', { valueAsNumber: true })} className="w-20" placeholder="Enter phosphorus" />
                <p className="text-xs text-muted-foreground mt-1">Optimal range: {optimalSoilRanges.phosphorus.min} - {optimalSoilRanges.phosphorus.max} {optimalSoilRanges.phosphorus.unit}</p>
                {errors.phosphorus && <p className="text-red-500 text-xs mt-1">{errors.phosphorus.message}</p>}
              </div>
              <div className="mb-3">
                <Label htmlFor="potassium">Potassium (0-1, e.g. 0.3)</Label>
                <Input type="number" step="0.01" {...register('potassium', { valueAsNumber: true })} className="w-20" placeholder="Enter potassium" />
                <p className="text-xs text-muted-foreground mt-1">Optimal range: {optimalSoilRanges.potassium.min} - {optimalSoilRanges.potassium.max} {optimalSoilRanges.potassium.unit}</p>
                {errors.potassium && <p className="text-red-500 text-xs mt-1">{errors.potassium.message}</p>}
              </div>
              <div className="mb-3">
                <Label htmlFor="moisture">Moisture (0-100, e.g. 40)</Label>
                <Input type="number" step="1" {...register('moisture', { valueAsNumber: true })} className="w-20" placeholder="Enter moisture" />
                <p className="text-xs text-muted-foreground mt-1">Optimal range: {optimalSoilRanges.moisture.min} - {optimalSoilRanges.moisture.max} {optimalSoilRanges.moisture.unit}</p>
                {errors.moisture && <p className="text-red-500 text-xs mt-1">{errors.moisture.message}</p>}
              </div>
              <Button type="submit" className="w-full">Analyze Soil</Button>
            </form>
          </div>
        </div>

        <div>
          {analyzedData && recommendations ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Crop Recommendations (from Database)</h2>
              {typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('moistureWarning') === 'true' && (
                <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-sm">
                  Note: Moisture is not used in the crop recommendation because the database does not contain moisture data.
                </div>
              )}
              <p className="text-muted-foreground">
                Based on your soil parameters and the real crop database, here are the most suitable crops:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.slice(0, 8).map((rec) => (
                  <div key={rec.crop} className="bg-card p-4 rounded shadow flex flex-col items-start">
                    <span className="font-semibold text-lg">{rec.crop}</span>
                    <span className="text-sm text-muted-foreground">Score: {(rec.score * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-muted p-6 rounded-lg h-full flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                Enter your soil parameters and click "Analyze Soil" to see crop recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilChecker;