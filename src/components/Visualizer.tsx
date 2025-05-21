import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { optimalSoilRanges } from '@/data/soilData';
import SoilDataVisualizer from './SoilDataVisualizer';

// Define form schema with validation
const soilFormSchema = z.object({
  pH: z.number().min(0).max(14),
  nitrogen: z.number().min(0).max(1),
  phosphorus: z.number().min(0).max(1),
  potassium: z.number().min(0).max(1),
  moisture: z.number().min(0).max(100),
});

export type SoilFormData = z.infer<typeof soilFormSchema>;

const Visualizer: React.FC = () => {
  const [visualizerData, setVisualizerData] = useState<SoilFormData | null>(null);

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
    setVisualizerData(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Soil Data Visualizer</h1>
      
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
              </div>

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
              </div>

              <Button type="submit" className="w-full">Visualize Data</Button>
            </form>
          </div>
        </div>

        <div>
          {visualizerData ? (
            <SoilDataVisualizer soilData={visualizerData} />
          ) : (
            <div className="bg-muted p-6 rounded-lg h-full flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                Enter your soil parameters and click "Visualize Data" to see the visualization
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizer;