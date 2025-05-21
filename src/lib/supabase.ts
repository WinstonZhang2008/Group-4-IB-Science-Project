import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://gtgisxhkwkdqroipnidb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Z2lzeGhrd2tkcXJvaXBuaWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MDg0MzEsImV4cCI6MjA2MzM4NDQzMX0.XplOfGbxdF1G0j0egEhoxHAwAQFUPMiatOzNj-5opGI';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };