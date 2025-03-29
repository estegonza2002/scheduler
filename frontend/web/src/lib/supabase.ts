import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

// Add a very basic fallback for development to prevent complete app failure
const finalSupabaseUrl = supabaseUrl || "https://fake-supabase-url.co";
const finalSupabaseKey = supabaseAnonKey || "fake-key-for-fallback";

let supabase: SupabaseClient;

try {
	// Create a single supabase client for interacting with your database
	supabase = createClient(finalSupabaseUrl, finalSupabaseKey);
	console.log(
		"Supabase client initialized with URL:",
		finalSupabaseUrl.substring(0, 20) + "..."
	);
} catch (error) {
	console.error("Failed to initialize Supabase client:", error);

	// Provide a dummy client that won't crash the app but will log errors
	supabase = {
		auth: {
			getSession: async () => ({ data: { session: null }, error: null }),
			getUser: async () => ({ data: { user: null }, error: null }),
			onAuthStateChange: () => ({
				data: { subscription: { unsubscribe: () => {} } },
			}),
			signInWithPassword: async () => ({
				data: { user: null, session: null },
				error: { message: "Supabase not initialized" },
			}),
			signInWithOAuth: async () => ({
				data: null,
				error: { message: "Supabase not initialized" },
			}),
			signUp: async () => ({
				data: { user: null, session: null },
				error: { message: "Supabase not initialized" },
			}),
			signOut: async () => ({ error: null }),
			resetPasswordForEmail: async () => ({ error: null }),
			updateUser: async () => ({ data: { user: null }, error: null }),
		},
		from: () => ({
			select: () => ({
				eq: () => ({
					single: async () => ({
						data: null,
						error: { message: "Supabase not initialized" },
					}),
				}),
			}),
		}),
	} as unknown as SupabaseClient;
}

export { supabase };
export default supabase;
