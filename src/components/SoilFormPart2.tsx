import React from 'react';
import { SoilFormData } from './SoilForm';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { optimalSoilRanges } from '@/data/soilData';

interface SoilFormPart2Props {
  watchedValues: SoilFormData;
  handleSliderChange: (name: keyof SoilFormData, value: number[]) => void;
  register: any; // from react-hook-form
  errors: any; // from react-hook-form
  onSubmit: () => void;
}

// This is a continuation of the SoilForm component to keep each file under the character limit
const SoilFormPart2: React.FC<SoilFormPart2Props> = ({ 
  watchedValues, 
  handleSliderChange, 
  register, 
  errors,
  onSubmit 
}) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="potassium">Potassium ({(watchedValues.potassium * 100).toFixed(1)}%)</Label>
        <div className="flex items-center gap-4 mt-2">
          <Slider
            id="potassium"
            min={0}
            max={1}
            step={0.01}
            value={[watchedValues.potassium]}
            onValueChange={(value) => handleSliderChange('potassium', value)}
            className="flex-1"
          />
          <Input
            type="number"
            step="0.01"
            {...register('potassium', { valueAsNumber: true })}
            className="w-20"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Optimal range: {optimalSoilRanges.potassium.min * 100} - {optimalSoilRanges.potassium.max * 100}%
        </p>
        {errors.potassium && <p className="text-red-500 text-xs mt-1">{errors.potassium.message}</p>}
      </div>

      <div>
        <Label htmlFor="moisture">Moisture ({watchedValues.moisture.toFixed(1)}%)</Label>
        <div className="flex items-center gap-4 mt-2">
          <Slider
            id="moisture"
            min={0}
            max={100}
            step={1}
            value={[watchedValues.moisture]}
            onValueChange={(value) => handleSliderChange('moisture', value)}
            className="flex-1"
          />
          <Input
            type="number"
            step="1"
            {...register('moisture', { valueAsNumber: true })}
            className="w-20"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Optimal range: {optimalSoilRanges.moisture.min} - {optimalSoilRanges.moisture.max}%
        </p>
        {errors.moisture && <p className="text-red-500 text-xs mt-1">{errors.moisture.message}</p>}
      </div>

      <Button type="button" onClick={onSubmit} className="w-full">Analyze Soil</Button>
    </div>
  );
};

export default SoilFormPart2;