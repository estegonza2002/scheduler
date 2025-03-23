import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth";

interface ProtectedRouteProps {
	redirectTo?: string;
	adminOnly?: boolean;
}

export function ProtectedRoute({
	redirectTo = "/login",
	adminOnly = false,
}: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	// Show loading indicator while checking auth state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Redirect if not authenticated
	if (!user) {
		return (
			<Navigate
				to={redirectTo}
				replace
			/>
		);
	}

	// Check if the route is admin-only and the user is not an admin
	const isAdmin = user?.user_metadata?.role === "admin";

	// Get the current path
	const path = location.pathname;

	// Admin-only routes
	const adminRoutes = [
		"/admin-dashboard",
		"/employees",
		"/business-profile",
		"/locations",
	];

	// Check if we're trying to access an admin route without admin privileges
	if (!isAdmin && adminRoutes.includes(path)) {
		return (
			<Navigate
				to="/dashboard"
				replace
			/>
		);
	}

	// Render the protected content
	return <Outlet />;
}
