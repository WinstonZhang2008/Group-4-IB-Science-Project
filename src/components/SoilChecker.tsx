import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { optimalSoilRanges } from '@/data/soilData';
import { cropRecommendationData } from '@/data/cropRecommendationDB';
import { coreData } from '@/data/coreDB';

const soilFormSchema = z.object({
  soil_pH: z.number().min(0).max(14),
  microbial_activity: z.number().min(0).max(10),
  phosphates_ppm: z.number().min(0),
  potassium_ppm: z.number().min(0),
  nitrates: z.number().min(0),
  aeration_compaction: z.number().min(0).max(10),
});

export type SoilFormData = z.infer<typeof soilFormSchema>;

// Utility to load and merge all crop data from all sources
async function loadUnifiedCropDB() {
  const [cropRec, core] = await Promise.all([
    cropRecommendationData(),
    coreData(),
  ]);
  // Map Crop_recommendation.csv
  const cropRecMapped = cropRec.map(row => ({
    crop: row.label,
    soil_pH: parseFloat(row.ph),
    phosphates_ppm: parseFloat(row.P),
    potassium_ppm: parseFloat(row.K),
    nitrates: parseFloat(row.N),
    microbial_activity: null,
    aeration_compaction: null,
    source: 'Crop_recommendation.csv',
  }));
  // Map data_core.csv
  const coreMapped = core.map(row => ({
    crop: row['Crop Type'],
    soil_pH: null, // not present
    phosphates_ppm: parseFloat(row['Phosphorous']),
    potassium_ppm: parseFloat(row['Potassium']),
    nitrates: parseFloat(row['Nitrogen']),
    microbial_activity: null,
    aeration_compaction: null,
    source: 'data_core.csv',
  }));
  // Merge and filter only those with a crop name
  return [...cropRecMapped, ...coreMapped].filter(row => row.crop && row.crop !== '');
}

function recommendCropsUnified(soil: SoilFormData, db: any[]): { crop: string; score: number }[] {
  // Only use features present in the DBs
  const features = [
    { user: 'soil_pH', db: 'soil_pH' },
    { user: 'phosphates_ppm', db: 'phosphates_ppm' },
    { user: 'potassium_ppm', db: 'potassium_ppm' },
    { user: 'nitrates', db: 'nitrates' },
  ];
  const filteredDB = db.filter(row =>
    features.every(({ db: dbKey }) => row[dbKey] !== null && !isNaN(row[dbKey]))
  );
  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};
  features.forEach(({ db: dbKey }) => {
    mins[dbKey] = Math.min(...filteredDB.map(row => row[dbKey]));
    maxs[dbKey] = Math.max(...filteredDB.map(row => row[dbKey]));
  });
  const normalizedUser: Record<string, number> = {};
  normalizedUser['soil_pH'] = soil.soil_pH;
  normalizedUser['phosphates_ppm'] = soil.phosphates_ppm;
  normalizedUser['potassium_ppm'] = soil.potassium_ppm;
  normalizedUser['nitrates'] = soil.nitrates;
  features.forEach(({ db: dbKey }) => {
    if (maxs[dbKey] !== mins[dbKey]) {
      normalizedUser[dbKey] = (normalizedUser[dbKey] - mins[dbKey]) / (maxs[dbKey] - mins[dbKey]);
    } else {
      normalizedUser[dbKey] = 0.5;
    }
  });
  const cropScores: Record<string, { total: number; count: number }> = {};
  filteredDB.forEach(row => {
    const rowNorm: Record<string, number> = {};
    features.forEach(({ db: dbKey }) => {
      if (maxs[dbKey] !== mins[dbKey]) {
        rowNorm[dbKey] = (row[dbKey] - mins[dbKey]) / (maxs[dbKey] - mins[dbKey]);
      } else {
        rowNorm[dbKey] = 0.5;
      }
    });
    const dist = Math.sqrt(features.reduce((sum, { db: dbKey }) => sum + Math.pow(rowNorm[dbKey] - normalizedUser[dbKey], 2), 0));
    const crop = row.crop;
    if (!cropScores[crop]) cropScores[crop] = { total: 0, count: 0 };
    cropScores[crop].total += dist;
    cropScores[crop].count += 1;
  });
  const ranked = Object.entries(cropScores)
    .map(([crop, { total, count }]) => ({ crop, score: count > 0 ? 1 - total / count : 0 }))
    .sort((a, b) => b.score - a.score);
  return ranked;
}

const SoilChecker: React.FC = () => {
  const [analyzedData, setAnalyzedData] = useState<SoilFormData | null>(null);
  const [unifiedDB, setUnifiedDB] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<{ crop: string; score: number }[] | null>(null);

  useEffect(() => {
    loadUnifiedCropDB().then(setUnifiedDB);
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
      soil_pH: 7,
      microbial_activity: 5,
      phosphates_ppm: 30,
      potassium_ppm: 30,
      nitrates: 30,
      aeration_compaction: 5,
    },
  });

  const onSubmit = (data: SoilFormData) => {
    setAnalyzedData(data);
    setRecommendations(recommendCropsUnified(data, unifiedDB));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Label htmlFor="soil_pH">Soil pH</Label>
            <Input type="number" step="0.01" {...register('soil_pH', { valueAsNumber: true })} className="w-20" placeholder="Enter soil pH" />
            {errors.soil_pH && <p className="text-red-500 text-xs mt-1">{errors.soil_pH.message}</p>}
          </div>
          <div>
            <Label htmlFor="microbial_activity">Microbial Activity (0-10)</Label>
            <Input type="number" step="0.1" {...register('microbial_activity', { valueAsNumber: true })} className="w-20" placeholder="Enter microbial activity" />
            {errors.microbial_activity && <p className="text-red-500 text-xs mt-1">{errors.microbial_activity.message}</p>}
          </div>
          <div>
            <Label htmlFor="phosphates_ppm">Phosphates (ppm)</Label>
            <Input type="number" step="0.1" {...register('phosphates_ppm', { valueAsNumber: true })} className="w-20" placeholder="Enter phosphates" />
            {errors.phosphates_ppm && <p className="text-red-500 text-xs mt-1">{errors.phosphates_ppm.message}</p>}
          </div>
          <div>
            <Label htmlFor="potassium_ppm">Potassium (ppm)</Label>
            <Input type="number" step="0.1" {...register('potassium_ppm', { valueAsNumber: true })} className="w-20" placeholder="Enter potassium" />
            {errors.potassium_ppm && <p className="text-red-500 text-xs mt-1">{errors.potassium_ppm.message}</p>}
          </div>
          <div>
            <Label htmlFor="nitrates">Nitrates (ppm)</Label>
            <Input type="number" step="0.1" {...register('nitrates', { valueAsNumber: true })} className="w-20" placeholder="Enter nitrates" />
            {errors.nitrates && <p className="text-red-500 text-xs mt-1">{errors.nitrates.message}</p>}
          </div>
          <div>
            <Label htmlFor="aeration_compaction">Aeration/Compaction (0-10)</Label>
            <Input type="number" step="0.1" {...register('aeration_compaction', { valueAsNumber: true })} className="w-20" placeholder="Enter aeration/compaction" />
            {errors.aeration_compaction && <p className="text-red-500 text-xs mt-1">{errors.aeration_compaction.message}</p>}
          </div>
        </div>
        <Button type="submit">Analyze Soil</Button>
      </form>
      {analyzedData && recommendations ? (
        <div className="space-y-6 mt-8">
          <h2 className="text-2xl font-bold">Crop Recommendations (from All Databases)</h2>
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
        <div className="bg-muted p-6 rounded-lg h-full flex items-center justify-center mt-8">
          <p className="text-center text-muted-foreground">
            Enter your soil parameters and click "Analyze Soil" to see crop recommendations
          </p>
        </div>
      )}
    </div>
  );
};

export default SoilChecker;