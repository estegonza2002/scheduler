import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "@/lib/organization-context";
import { BusinessSetupModal } from "@/components/auth/BusinessSetupModal";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
	const navigate = useNavigate();
	const { user, isLoading } = useAuth();
	const { organizations, isLoading: isLoadingOrgs } = useOrganization();
	const [showBusinessSetup, setShowBusinessSetup] = useState(false);
	const [processingAuth, setProcessingAuth] = useState(true);

	// Handle redirection after auth callback
	useEffect(() => {
		const handleAuthRedirect = async () => {
			try {
				console.log("Auth callback processing started");
				console.log(
					"Business signup flag:",
					localStorage.getItem("business_signup")
				);

				// Explicitly get the session to ensure it's properly loaded
				const {
					data: { session },
				} = await supabase.auth.getSession();
				console.log("Current session:", session ? "Active" : "None");

				if (session?.user) {
					console.log("User authenticated:", session.user.email);

					// Check if this is a business signup
					if (localStorage.getItem("business_signup") === "true") {
						console.log(
							"Detected business signup flow, showing business setup modal"
						);
						setShowBusinessSetup(true);
					} else {
						// Check if this is a new user (no role in metadata)
						const userMetadata = session.user.user_metadata || {};
						const hasRole = userMetadata.role !== undefined;

						console.log("User metadata check:", {
							hasRole,
							metadata: userMetadata,
						});

						if (!hasRole) {
							// New user - redirect to role selection
							console.log("New user detected, redirecting to role selection");
							navigate("/role-selection", { replace: true });
						} else if (!isLoadingOrgs && organizations.length > 1) {
							// User has multiple organizations - redirect to organization selection
							console.log(
								"User has multiple organizations, redirecting to organization selection"
							);
							navigate("/organization-selection", { replace: true });
						} else {
							// Regular user login - check if admin
							const isAdmin = userMetadata.role === "admin";
							console.log("Regular user login, isAdmin:", isAdmin);

							// Use a short timeout to ensure navigation happens after state updates
							setTimeout(() => {
								navigate(isAdmin ? "/admin-dashboard" : "/dashboard", {
									replace: true,
								});
							}, 100);
						}
					}
				} else {
					console.log("No authenticated user found, redirecting to login");
					navigate("/login", { replace: true });
				}
			} catch (error) {
				console.error("Error in auth callback:", error);
				navigate("/login", { replace: true });
			} finally {
				setProcessingAuth(false);
			}
		};

		// Only run once when component mounts
		handleAuthRedirect();
	}, [navigate, organizations, isLoadingOrgs]);

	if (processingAuth) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
					<h2 className="text-xl font-medium">Processing your sign-in...</h2>
					<p className="text-muted-foreground mt-2">
						Please wait while we complete your authentication.
					</p>
				</div>
			</div>
		);
	}

	if (showBusinessSetup) {
		return (
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
		);
	}

	// Handle organization creation errors
	if (showBusinessSetup) {
		localStorage.setItem("business_setup_pending", "true");
	}

	// Fallback - should not normally be seen
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h2 className="text-xl font-medium">Redirecting...</h2>
			</div>
		</div>
	);
}
