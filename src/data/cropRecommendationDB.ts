import { fetchAndParseCSV } from './csvUtils';

export async function cropRecommendationData() {
  return fetchAndParseCSV<CropRecommendation>('/Crop_recommendation.csv');
}

export type CropRecommendation = {
  N: string;
  P: string;
  K: string;
  temperature: string;
  humidity: string;
  ph: string;
  rainfall: string;
  label: string;
};
