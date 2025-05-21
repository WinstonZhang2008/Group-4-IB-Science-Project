import React, { useEffect, useRef } from 'react';
import { SoilFormData } from './SoilForm';
import { optimalSoilRanges } from '@/data/soilData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from 'chart.js/auto';

interface SoilDataVisualizerProps {
  soilData: SoilFormData;
}

const SoilDataVisualizer: React.FC<SoilDataVisualizerProps> = ({ soilData }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Determine if a value is within optimal range
  const getStatusColor = (value: number, min: number, max: number): string => {
    if (value >= min && value <= max) {
      return 'rgba(34, 197, 94, 0.8)'; // green - optimal
    } else if (value >= min * 0.7 && value <= max * 1.3) {
      return 'rgba(234, 179, 8, 0.8)';  // yellow - close
    } else {
      return 'rgba(239, 68, 68, 0.8)';  // red - far off
    }
  };

  // Format labels for display
  const formatLabel = (key: keyof SoilFormData): string => {
    const labels: Record<keyof SoilFormData, string> = {
      pH: 'pH',
      nitrogen: 'Nitrogen (%)',
      phosphorus: 'Phosphorus (%)',
      potassium: 'Potassium (%)',
      moisture: 'Moisture (%)'
    };
    return labels[key];
  };

  // Format values for display
  const formatValue = (key: keyof SoilFormData, value: number): string => {
    if (key === 'pH') return value.toFixed(1);
    if (key === 'moisture') return `${value.toFixed(1)}%`;
    return `${(value * 100).toFixed(1)}%`;
  };

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Prepare data for chart
      const labels = Object.keys(soilData) as (keyof SoilFormData)[];
      const values = labels.map(key => {
        // Normalize values for display
        if (key === 'nitrogen' || key === 'phosphorus' || key === 'potassium') {
          return soilData[key] * 100; // Convert to percentage
        }
        return soilData[key];
      });

      // Get colors based on optimal ranges
      const backgroundColors = labels.map(key => {
        const range = optimalSoilRanges[key];
        return getStatusColor(soilData[key], range.min, range.max);
      });

      // Create chart
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels.map(formatLabel),
          datasets: [{
            label: 'Your Soil Values',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const key = labels[context.dataIndex];
                  const value = soilData[key];
                  const range = optimalSoilRanges[key];
                  return [
                    `Value: ${formatValue(key, value)}`,
                    `Optimal range: ${formatValue(key, range.min)} - ${formatValue(key, range.max)}`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [soilData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soil Parameter Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <canvas ref={chartRef}></canvas>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Optimal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm">Close to optimal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">Far from optimal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoilDataVisualizer;