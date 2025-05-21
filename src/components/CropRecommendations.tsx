import React from 'react';
import { SoilFormData } from './SoilForm';
import { cropRequirements, CropRequirement } from '@/data/soilData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CropRecommendationsProps {
  soilData: SoilFormData;
}

const CropRecommendations: React.FC<CropRecommendationsProps> = ({ soilData }) => {
  // Calculate suitability score for each crop
  const getSuitabilityScore = (crop: CropRequirement, soil: SoilFormData): number => {
    let score = 0;
    const parameters: (keyof SoilFormData)[] = ['pH', 'nitrogen', 'phosphorus', 'potassium', 'moisture'];
    
    parameters.forEach(param => {
      // Check if soil parameter is within the crop's optimal range
      const soilValue = soil[param];
      const cropMin = crop[param].min;
      const cropMax = crop[param].max;
      
      if (soilValue >= cropMin && soilValue <= cropMax) {
        // Parameter is optimal
        score += 1;
      } else {
        // Calculate how far outside the range the parameter is
        const distanceFromRange = soilValue < cropMin 
          ? (cropMin - soilValue) / cropMin 
          : (soilValue - cropMax) / cropMax;
        
        // Score decreases as distance increases
        score += Math.max(0, 1 - distanceFromRange);
      }
    });
    
    // Return normalized score (0-100%)
    return (score / parameters.length) * 100;
  };

  // Sort crops by suitability score
  const rankedCrops = cropRequirements
    .map(crop => ({
      ...crop,
      score: getSuitabilityScore(crop, soilData)
    }))
    .sort((a, b) => b.score - a.score);

  // Get suitability label based on score
  const getSuitabilityLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 40) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Crop Recommendations</h2>
      <p className="text-muted-foreground">
        Based on your soil parameters, here are the most suitable crops for Martian cultivation:
      </p>
      
      <div className="grid gap-4 md:grid-cols-2">
        {rankedCrops.map((crop) => {
          const suitability = getSuitabilityLabel(crop.score);
          
          return (
            <Card key={crop.name} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{crop.name}</CardTitle>
                  <Badge className={suitability.color}>
                    {suitability.label} ({Math.round(crop.score)}%)
                  </Badge>
                </div>
                <CardDescription>{crop.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium mb-2">Mars-Specific Notes:</p>
                  <p className="text-muted-foreground">{crop.martianNotes}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CropRecommendations;