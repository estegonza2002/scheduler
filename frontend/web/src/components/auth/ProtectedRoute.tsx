import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { Card, CardContent } from "../ui/card";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ProtectedRouteProps {
	redirectTo?: string;
	// adminOnly?: boolean; // TODO: Re-enable when Firebase role check is implemented
	children?: ReactNode;
}

export function ProtectedRoute({
	redirectTo = "/login",
	// adminOnly = false, // TODO: Re-enable when Firebase role check is implemented
	children,
}: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	// Show loading indicator while checking auth state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="p-6">
					<CardContent className="flex items-center justify-center">
						<Loader2 className="h-12 w-12 animate-spin text-primary" />
					</CardContent>
				</Card>
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

	// TODO: Implement admin check based on Firebase user data (custom claims or Firestore)
	/*
	// Check if the route is admin-only and the user is not an admin
	const isAdmin = user?.user_metadata?.role === "admin"; // <-- Needs Firebase update

	// Get the current path
	const path = location.pathname;

	// Admin-only routes
	const adminRoutes = [
		"/admin-dashboard",
		"/employees",
		"/locations",
		"/account",
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
	*/

	// Render the protected content (either children or Outlet)
	return children ? <>{children}</> : <Outlet />;
}
