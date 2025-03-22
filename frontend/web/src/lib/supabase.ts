import { createClient } from "@supabase/supabase-js";

// Define environment variables with fallbacks for type safety
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey =
	(import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

// Validate that the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
	console.error(
		"Supabase URL and/or anon key not found in environment variables. " +
			"Make sure to create an .env file based on .env.example with your Supabase credentials."
	);
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
