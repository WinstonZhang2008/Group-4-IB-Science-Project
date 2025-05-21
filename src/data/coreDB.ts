import { fetchAndParseCSV } from './csvUtils';

export async function coreData() {
  return fetchAndParseCSV<CoreData>('/data_core.csv');
}

export type CoreData = {
  Temparature: string;
  Humidity: string;
  Moisture: string;
  'Soil Type': string;
  'Crop Type': string;
  Nitrogen: string;
  Potassium: string;
  Phosphorous: string;
  'Fertilizer Name': string;
};
