import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { BusinessSetupModal } from "@/components/auth/BusinessSetupModal";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
	const navigate = useNavigate();
	const { user, isLoading } = useAuth();
	const [showBusinessSetup, setShowBusinessSetup] = useState(false);
	const [processingAuth, setProcessingAuth] = useState(true);
	const [redirectAttempted, setRedirectAttempted] = useState(false);

	// Handle redirection after auth callback
	useEffect(() => {
		const handleAuthRedirect = async () => {
			// Only proceed if auth loading is complete AND redirect hasn't been attempted
			if (isLoading || redirectAttempted) {
				console.log("Auth callback: Waiting or redirect already attempted...", {
					isLoading,
					redirectAttempted,
				});
				if (isLoading) {
					setProcessingAuth(true); // Keep showing processing indicator if loading
				}
				return;
			}

			setProcessingAuth(false); // Auth loading is done
			setRedirectAttempted(true); // Mark redirect as attempted

			try {
				console.log(
					"Auth callback processing started (after loading check, first attempt)"
				);

				if (user) {
					// Check user state from AuthProvider
					console.log("User authenticated via AuthProvider:", user.email);

					// Check for business signup flow
					if (localStorage.getItem("business_signup") === "true") {
						console.log(
							"Detected business signup flow, showing business setup modal"
						);
						setShowBusinessSetup(true);
					} else {
						// Regular user login - redirect based on role
						const isAdmin = user.user_metadata?.role === "admin";
						console.log("Regular user login, isAdmin:", isAdmin);
						navigate(isAdmin ? "/admin-dashboard" : "/dashboard", {
							replace: true,
						});
					}
				} else {
					// No user found after loading, redirect to login
					console.log(
						"No authenticated user found after loading, redirecting to login"
					);
					navigate("/login", { replace: true });
				}
			} catch (error) {
				console.error("Error in auth callback:", error);
				navigate("/login", { replace: true });
			}
		};

		handleAuthRedirect();
	}, [navigate, user, isLoading, redirectAttempted]); // Add redirectAttempted dependency

	return (
		<>
			{processingAuth ? (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
						<h2 className="text-xl font-medium">Processing your sign-in...</h2>
						<p className="text-muted-foreground mt-2">
							Please wait while we complete your authentication.
						</p>
					</div>
				</div>
			) : showBusinessSetup ? (
				<>
					<BusinessSetupModal
						isOpen={showBusinessSetup}
						onClose={() => {
							setShowBusinessSetup(false);
							localStorage.removeItem("business_signup");
							navigate("/admin-dashboard", { replace: true });
						}}
					/>
					<div className="min-h-screen flex items-center justify-center">
						<div className="text-center max-w-md px-4">
							<h2 className="text-2xl font-semibold mb-2">
								Complete Your Business Setup
							</h2>
							<p className="text-muted-foreground">
								Please provide your business details to finish the registration
								process.
							</p>
						</div>
					</div>
				</>
			) : (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-medium">Redirecting...</h2>
					</div>
				</div>
			)}
		</>
	);
}
