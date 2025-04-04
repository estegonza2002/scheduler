import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface GoogleBusinessButtonProps {
	text?: string;
}

export function GoogleBusinessButton({
	text = "Sign up business with Google",
}: GoogleBusinessButtonProps) {
	const { signInWithGoogle } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleGoogleBusinessSignIn = async () => {
		setIsLoading(true);
		setError(null);
		try {
			console.log("Starting Google Business sign-in process...");
			localStorage.setItem("business_signup", "true");

			await signInWithGoogle();
		} catch (error: any) {
			console.error("Google Business Sign-In Failed:", error);
			setError(error.message || "An unexpected error occurred.");
			toast.error(`Google sign-in failed: ${error.message || "Unknown error"}`);
			localStorage.removeItem("business_signup");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			type="button"
			variant="outline"
			className="w-full"
			onClick={handleGoogleBusinessSignIn}
			disabled={isLoading}>
			{isLoading ? (
				"Loading..."
			) : (
				<div className="flex items-center justify-center">
					<FcGoogle className="mr-2 h-5 w-5" />
					{text}
				</div>
			)}
			{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
		</Button>
	);
}
