import { supabase } from '@/lib/supabase';
import { SoilFormData } from '@/components/SoilForm';

// Function to submit soil data and get crop recommendations
export async function getCropRecommendations(soilData: SoilFormData) {
  try {
    const response = await fetch(
      'https://gtgisxhkwkdqroipnidb.supabase.co/functions/v1/bb86e00b-fdb4-4f68-a6fc-b1d950db73bf',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ph: soilData.pH,
          nitrogen: soilData.nitrogen,
          phosphorus: soilData.phosphorus,
          potassium: soilData.potassium,
          moisture: soilData.moisture,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get crop recommendations');
    }

    const data = await response.json();
    return data.crops;
  } catch (error) {
    console.error('Error getting crop recommendations:', error);
    throw error;
  }
}

// Function to get soil data for visualization
export async function getSoilData() {
  try {
    const response = await fetch(
      'https://gtgisxhkwkdqroipnidb.supabase.co/functions/v1/2d616d0e-7d37-4fc6-963f-d3ec5d8f4a3d',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get soil data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting soil data:', error);
    throw error;
  }
}
