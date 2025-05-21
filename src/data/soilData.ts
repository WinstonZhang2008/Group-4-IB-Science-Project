// Soil data for Mars and crop requirements

// Optimal soil parameters for plant growth on Earth (baseline)
export const optimalSoilRanges = {
  pH: { min: 6.0, max: 7.0, unit: 'pH' },
  nitrogen: { min: 0.2, max: 0.5, unit: '%' },
  phosphorus: { min: 0.1, max: 0.3, unit: '%' },
  potassium: { min: 0.2, max: 0.5, unit: '%' },
  moisture: { min: 20, max: 60, unit: '%' },
};

// Crop requirements adjusted for Martian conditions
export interface CropRequirement {
  name: string;
  pH: { min: number; max: number };
  nitrogen: { min: number; max: number };
  phosphorus: { min: number; max: number };
  potassium: { min: number; max: number };
  moisture: { min: number; max: number };
  description: string;
  martianNotes: string;
}

export const cropRequirements: CropRequirement[] = [
  {
    name: 'Lettuce',
    pH: { min: 6.0, max: 7.0 },
    nitrogen: { min: 0.15, max: 0.4 },
    phosphorus: { min: 0.1, max: 0.25 },
    potassium: { min: 0.15, max: 0.3 },
    moisture: { min: 30, max: 50 },
    description: 'Fast-growing leafy vegetable with high water content',
    martianNotes: 'Good candidate for Martian greenhouses due to short growth cycle and low light requirements'
  },
  {
    name: 'Spinach',
    pH: { min: 6.0, max: 7.5 },
    nitrogen: { min: 0.2, max: 0.5 },
    phosphorus: { min: 0.15, max: 0.3 },
    potassium: { min: 0.2, max: 0.4 },
    moisture: { min: 25, max: 45 },
    description: 'Nutrient-dense leafy green with high iron content',
    martianNotes: 'Tolerates lower light conditions and can be harvested multiple times'
  },
  {
    name: 'Radish',
    pH: { min: 6.0, max: 7.0 },
    nitrogen: { min: 0.1, max: 0.3 },
    phosphorus: { min: 0.1, max: 0.25 },
    potassium: { min: 0.15, max: 0.35 },
    moisture: { min: 20, max: 40 },
    description: 'Quick-growing root vegetable with edible tops',
    martianNotes: 'Excellent for Martian cultivation due to fast growth and efficient use of space'
  },
  {
    name: 'Tomato',
    pH: { min: 5.8, max: 7.0 },
    nitrogen: { min: 0.2, max: 0.5 },
    phosphorus: { min: 0.2, max: 0.4 },
    potassium: { min: 0.25, max: 0.5 },
    moisture: { min: 25, max: 55 },
    description: 'Versatile fruit with high vitamin content',
    martianNotes: 'Requires more resources but provides significant nutritional benefits; dwarf varieties recommended'
  },
  {
    name: 'Carrot',
    pH: { min: 6.0, max: 7.0 },
    nitrogen: { min: 0.1, max: 0.3 },
    phosphorus: { min: 0.15, max: 0.3 },
    potassium: { min: 0.2, max: 0.4 },
    moisture: { min: 15, max: 35 },
    description: 'Root vegetable rich in beta-carotene and fiber',
    martianNotes: 'Good storage capabilities and efficient use of vertical space in Martian soil columns'
  }
];

export * from './cropRecommendationDB';
export * from './coreDB';
export * from './plantHealthDB';
