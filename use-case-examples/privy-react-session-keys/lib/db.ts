import { createClient } from '@supabase/supabase-js'


const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string;

export const createDBClient = () => {
    return createClient(SUPABASE_URL, SUPABASE_KEY);
}