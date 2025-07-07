import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvofozvpckjkrzcikvnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2b2ZvenZwY2tqa3J6Y2lrdm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMjU0NDIsImV4cCI6MjAzNjkwMTQ0Mn0.jfAm0APE3SIWHlWjiWDInPb0FSxpUvYz4QRZdGbmU_w';

export const supabase = createClient(supabaseUrl, supabaseKey);