import { createContext, useContext, useEffect, useState } from "react";
import {
	User,
	Session,
	AuthError,
	AuthResponse,
	SignInWithPasswordCredentials,
	SignUpWithPasswordCredentials,
	Provider,
	OAuthResponse,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
	signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>;
	signInWithGoogle: () => Promise<OAuthResponse>;
	signOut: () => Promise<{ error: AuthError | null }>;
	resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
	updateUserMetadata: (metadata: Record<string, any>) => Promise<{
		user: User | null;
		error: AuthError | null;
	}>;
	updatePassword: (password: string) => Promise<{
		user: User | null;
		error: AuthError | null;
	}>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Get initial session
		const initializeAuth = async () => {
			setIsLoading(true);

			// Get session on load
			const { data } = await supabase.auth.getSession();
			console.log("Initial session check:", data.session ? "Active" : "None");

			setSession(data.session);
			setUser(data.session?.user ?? null);
			setIsLoading(false);
		};

		initializeAuth();

		// Set up auth state listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			console.log("Auth state changed, event:", _event);
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const signUp = async (credentials: SignUpWithPasswordCredentials) => {
		console.log("Auth provider signUp called with:", {
			// Type-safe way to log credentials without exposing the password
			hasEmail: "email" in credentials,
			hasPassword: !!credentials.password,
			hasOptions: !!credentials.options,
		});

		try {
			const response = await supabase.auth.signUp(credentials);

			console.log("Supabase signUp response:", {
				error: response.error
					? {
							message: response.error.message,
							status: response.error.status,
							name: response.error.name,
					  }
					: null,
				user: response.data?.user
					? {
							id: response.data.user.id,
							email: response.data.user.email,
							emailConfirmed: response.data.user.email_confirmed_at !== null,
							metadata: response.data.user.user_metadata,
					  }
					: null,
				session: response.data?.session ? "Session exists" : "No session",
			});

			return response;
		} catch (error) {
			console.error("Exception in signUp method:", error);
			throw error;
		}
	};

	const signIn = async (credentials: SignInWithPasswordCredentials) => {
		return await supabase.auth.signInWithPassword(credentials);
	};

	const signInWithGoogle = async () => {
		console.log(
			"Initiating Google sign-in with redirect to:",
			`${window.location.origin}/auth-callback`
		);
		return await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth-callback`,
				queryParams: {
					prompt: "select_account",
				},
			},
		});
	};

	const signOut = async () => {
		return await supabase.auth.signOut();
	};

	const resetPassword = async (email: string) => {
		return await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});
	};

	const updateUserMetadata = async (metadata: Record<string, any>) => {
		const { data, error } = await supabase.auth.updateUser({
			data: metadata,
		});

		if (!error && data?.user) {
			setUser(data.user);
		}

		return { user: data?.user || null, error };
	};

	const updatePassword = async (password: string) => {
		const { data, error } = await supabase.auth.updateUser({
			password: password,
		});

		return { user: data?.user || null, error };
	};

	const value = {
		user,
		session,
		isLoading,
		signUp,
		signIn,
		signInWithGoogle,
		signOut,
		resetPassword,
		updateUserMetadata,
		updatePassword,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
