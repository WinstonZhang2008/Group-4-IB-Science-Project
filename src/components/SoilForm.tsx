import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { optimalSoilRanges } from '@/data/soilData';

// Define form schema with validation
const soilFormSchema = z.object({
  pH: z.number().min(0).max(14),
  nitrogen: z.number().min(0).max(1),
  phosphorus: z.number().min(0).max(1),
  potassium: z.number().min(0).max(1),
  moisture: z.number().min(0).max(100),
});

export type SoilFormData = z.infer<typeof soilFormSchema>;

interface SoilFormProps {
  onSubmit: (data: SoilFormData) => void;
}

const SoilForm: React.FC<SoilFormProps> = ({ onSubmit }) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
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
      </div>

      <Button type="submit" className="w-full">Analyze Soil</Button>
    </form>
  );
};

export default SoilForm;