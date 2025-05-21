import React from 'react';
import { Bar as RechartsBar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }>;
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: {
      y?: {
        beginAtZero?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
      x?: {
        title?: {
          display?: boolean;
          text?: string;
        };
      };
    };
    plugins?: {
      tooltip?: {
        callbacks?: {
          afterLabel?: (context: any) => string;
        };
      };
      legend?: {
        display?: boolean;
      };
    };
  };
}

export const Bar: React.FC<BarProps> = ({ data, options }) => {
  // Transform the Chart.js data format to Recharts format
  const transformedData = data.labels.map((label, index) => {
    const result: Record<string, any> = { name: label };
    data.datasets.forEach(dataset => {
      result[dataset.label] = dataset.data[index];
      result[`color${index}`] = dataset.backgroundColor[index];
    });
    return result;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={transformedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          label={options?.scales?.x?.title?.display ? { 
            value: options.scales.x.title.text, 
            position: 'bottom' 
          } : undefined}
        />
        <YAxis 
          label={options?.scales?.y?.title?.display ? { 
            value: options.scales.y.title.text, 
            angle: -90, 
            position: 'left' 
          } : undefined}
        />
        <Tooltip />
        {data.datasets.map((dataset, datasetIndex) => (
          <RechartsBar
            key={datasetIndex}
            dataKey={dataset.label}
            fill={(entry) => entry[`color${transformedData.indexOf(entry)}`]}
            name={dataset.label}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
