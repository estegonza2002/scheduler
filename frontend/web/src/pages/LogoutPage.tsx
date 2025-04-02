import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function LogoutPage() {
	const { signOut } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const performLogout = async () => {
			try {
				const { error } = await signOut();

				if (error) {
					toast.error(`Failed to log out: ${error.message}`);
					console.error("Logout error:", error);
				} else {
					toast.success("You have been logged out successfully");
					// Clear any local storage items related to the session
					localStorage.removeItem("business_signup");
					localStorage.removeItem("business_setup_pending");
				}
			} catch (err) {
				console.error("Exception during logout:", err);
				toast.error("An unexpected error occurred during logout");
			} finally {
				// Always redirect to login page, even if there was an error
				navigate("/login", { replace: true });
			}
		};

		performLogout();
	}, [signOut, navigate]);

	// Show a loading state while logout is processing
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
				<h2 className="text-xl font-medium">Logging out...</h2>
				<p className="text-muted-foreground mt-2">
					Please wait while we sign you out.
				</p>
			</div>
		</div>
	);
}
