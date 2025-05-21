import { fetchAndParseCSV } from './csvUtils';

export async function plantHealthData() {
  return fetchAndParseCSV<PlantHealthData>('/plant_health_data.csv');
}

export type PlantHealthData = {
  Timestamp: string;
  Plant_ID: string;
  Soil_Moisture: string;
  Ambient_Temperature: string;
  Soil_Temperature: string;
  Humidity: string;
  Light_Intensity: string;
  Soil_pH: string;
  Nitrogen_Level: string;
  Phosphorus_Level: string;
  Potassium_Level: string;
  Chlorophyll_Content: string;
  Electrochemical_Signal: string;
  Plant_Health_Status: string;
};
