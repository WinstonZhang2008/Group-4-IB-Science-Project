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
  // Normalize user input and DB values for fair comparison
  const features = ['N', 'P', 'K', 'ph'];

  // Find min/max for normalization
  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};
  features.forEach(f => {
    mins[f] = Math.min(...db.map(row => parseFloat(row[f])));
    maxs[f] = Math.max(...db.map(row => parseFloat(row[f])));
  });

  // Normalize user input
  const normalizedUser: Record<string, number> = {};
  normalizedUser['N'] = soil.nitrogen * 100; // assuming user input is 0-1, DB is 0-100
  normalizedUser['P'] = soil.phosphorus * 100;
  normalizedUser['K'] = soil.potassium * 100;
  normalizedUser['ph'] = soil.pH;

  features.forEach(f => {
    normalizedUser[f] = (normalizedUser[f] - mins[f]) / (maxs[f] - mins[f]);
  });

  // Score each crop in the DB by distance to user input
  const cropScores: Record<string, { total: number; count: number }> = {};
  db.forEach(row => {
    const rowNorm: Record<string, number> = {};
    features.forEach(f => {
      rowNorm[f] = (parseFloat(row[f]) - mins[f]) / (maxs[f] - mins[f]);
    });
    const dist = Math.sqrt(features.reduce((sum, f) => sum + Math.pow(rowNorm[f] - normalizedUser[f], 2), 0));
    const crop = row.label;
    if (!cropScores[crop]) cropScores[crop] = { total: 0, count: 0 };
    cropScores[crop].total += dist;
    cropScores[crop].count += 1;
  });

  // Average and sort
  const ranked = Object.entries(cropScores)
    .map(([crop, { total, count }]) => ({ crop, score: 1 - total / count })) // invert distance for score
    .sort((a, b) => b.score - a.score);
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
      nitrogen: 0.3,
      phosphorus: 0.2,
      potassium: 0.3,
      moisture: 40,
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
              <div>
                <Label htmlFor="pH">pH Level ({watchedValues.pH})</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="pH"
                    min={0}
                    max={14}
                    step={0.1}
                    value={[watchedValues.pH]}
                    onValueChange={(value) => handleSliderChange('pH', value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    {...register('pH', { valueAsNumber: true })}
                    className="w-20"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Optimal range: {optimalSoilRanges.pH.min} - {optimalSoilRanges.pH.max} {optimalSoilRanges.pH.unit}
                </p>
                {errors.pH && <p className="text-red-500 text-xs mt-1">{errors.pH.message}</p>}
              </div>

              <div>
                <Label htmlFor="nitrogen">Nitrogen ({(watchedValues.nitrogen * 100).toFixed(1)}%)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="nitrogen"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[watchedValues.nitrogen]}
                    onValueChange={(value) => handleSliderChange('nitrogen', value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    {...register('nitrogen', { valueAsNumber: true })}
                    className="w-20"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Optimal range: {optimalSoilRanges.nitrogen.min * 100} - {optimalSoilRanges.nitrogen.max * 100}%
                </p>
                {errors.nitrogen && <p className="text-red-500 text-xs mt-1">{errors.nitrogen.message}</p>}
              </div>

              <div>
                <Label htmlFor="phosphorus">Phosphorus ({(watchedValues.phosphorus * 100).toFixed(1)}%)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="phosphorus"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[watchedValues.phosphorus]}
                    onValueChange={(value) => handleSliderChange('phosphorus', value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    {...register('phosphorus', { valueAsNumber: true })}
                    className="w-20"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Optimal range: {optimalSoilRanges.phosphorus.min * 100} - {optimalSoilRanges.phosphorus.max * 100}%
                </p>
                {errors.phosphorus && <p className="text-red-500 text-xs mt-1">{errors.phosphorus.message}</p>}
              </div>

              <Button type="submit" className="w-full">Analyze Soil</Button>
            </form>
          </div>
        </div>

        <div>
          {analyzedData && recommendations ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Crop Recommendations (from Database)</h2>
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