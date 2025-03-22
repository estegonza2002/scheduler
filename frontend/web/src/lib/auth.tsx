import { createContext, useContext, useEffect, useState } from "react";
import {
	User,
	Session,
	AuthError,
	AuthResponse,
	SignInWithPasswordCredentials,
	SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
	signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>;
	signOut: () => Promise<{ error: AuthError | null }>;
	resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
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
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		// Set up auth state listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const signUp = async (credentials: SignUpWithPasswordCredentials) => {
		return await supabase.auth.signUp(credentials);
	};

	const signIn = async (credentials: SignInWithPasswordCredentials) => {
		return await supabase.auth.signInWithPassword(credentials);
	};

	const signOut = async () => {
		return await supabase.auth.signOut();
	};

	const resetPassword = async (email: string) => {
		return await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});
	};

	const value = {
		user,
		session,
		isLoading,
		signUp,
		signIn,
		signOut,
		resetPassword,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
