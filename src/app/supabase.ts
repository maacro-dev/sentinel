import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:54321"
    : "https://lmhkgxzfqzryocbjqcfi.supabase.co";

const supabaseKey =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_SUPABASE_KEY_DEV
    : import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
