import { Button } from "./components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./components/ui/card";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import { useState } from "react";
import { ScheduleCalendar } from "./components/ScheduleCalendar";
import { OrganizationSelector } from "./components/OrganizationSelector";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { AuthProvider, useAuth } from "./lib/auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AppLayoutNew from "./components/layout/AppLayoutNew";

// Import our pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import BusinessSignUpPage from "./pages/BusinessSignUpPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import BusinessProfilePage from "./pages/BusinessProfilePage";
import SchedulePage from "./pages/SchedulePage";
import DailyShiftsPage from "./pages/DailyShiftsPage";
import EmployeesPage from "./pages/EmployeesPage";
import ShiftDetailsPage from "./pages/ShiftDetailsPage";

// Root redirect component that checks user role
function RootRedirect() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user) {
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	}

	// Check if user is an admin
	const isAdmin = user?.user_metadata?.role === "admin";
	return (
		<Navigate
			to={isAdmin ? "/admin-dashboard" : "/dashboard"}
			replace
		/>
	);
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					{/* Public Routes */}
					<Route
						path="/login"
						element={<LoginPage />}
					/>
					<Route
						path="/signup"
						element={<SignUpPage />}
					/>
					<Route
						path="/business-signup"
						element={<BusinessSignUpPage />}
					/>

					{/* Protected Routes */}
					<Route element={<ProtectedRoute />}>
						<Route element={<AppLayoutNew />}>
							<Route
								path="/dashboard"
								element={<DashboardPage />}
							/>
							<Route
								path="/admin-dashboard"
								element={<AdminDashboardPage />}
							/>
							<Route
								path="/schedule"
								element={<SchedulePage />}
							/>
							<Route
								path="/daily-shifts"
								element={<DailyShiftsPage />}
							/>
							<Route
								path="/today"
								element={
									<Navigate
										to={`/daily-shifts?date=${
											new Date().toISOString().split("T")[0]
										}`}
										replace
									/>
								}
							/>
							<Route
								path="/profile"
								element={<ProfilePage />}
							/>
							<Route
								path="/business-profile"
								element={<BusinessProfilePage />}
							/>
							<Route
								path="/employees"
								element={<EmployeesPage />}
							/>
							<Route
								path="/shifts/:shiftId"
								element={<ShiftDetailsPage />}
							/>
							{/* Add more protected routes here */}
						</Route>
					</Route>

					{/* Redirect to appropriate dashboard based on role */}
					<Route
						path="/"
						element={<RootRedirect />}
					/>
					<Route
						path="*"
						element={
							<Navigate
								to="/login"
								replace
							/>
						}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
