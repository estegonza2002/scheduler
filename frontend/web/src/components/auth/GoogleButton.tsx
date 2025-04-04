import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface GoogleButtonProps {
	onClick?: () => void;
	variant?: "default" | "outline" | "secondary";
	text?: string;
}

export function GoogleButton({
	onClick,
	variant = "outline",
	text = "Continue with Google",
}: GoogleButtonProps) {
	const { signInWithGoogle } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);
		try {
			console.log("Starting Google sign-in process...");

			// Clear any potential business signup flags
			localStorage.removeItem("business_signup");

			// Use the function obtained from the useAuth hook
			await signInWithGoogle();

			// No explicit success handling needed here if AuthProvider handles it
			// Toast notification can be added in AuthProvider or upon successful navigation
		} catch (error: any) {
			console.error("Google Sign-In Failed:", error);
			setError(error.message || "An unexpected error occurred.");
			toast.error(`Google sign-in failed: ${error.message || "Unknown error"}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={variant}
			size="lg"
			className="w-full"
			onClick={() => {
				handleGoogleSignIn();
				if (onClick) onClick();
			}}
			disabled={isLoading}>
			{isLoading ? (
				<span className="animate-spin mr-2">⏳</span>
			) : (
				<FcGoogle className="mr-2 h-5 w-5" />
			)}
			{text}
			{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
		</Button>
	);
}
