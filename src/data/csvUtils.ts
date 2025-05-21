import Papa from 'papaparse';

export function parseCSV<T extends Record<string, string>>(csvText: string): T[] {
  const result = Papa.parse<T>(csvText, { header: true, skipEmptyLines: true });
  return result.data;
}

export async function fetchAndParseCSV<T extends Record<string, string>>(url: string): Promise<T[]> {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV<T>(text);
}
