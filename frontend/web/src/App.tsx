import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { NotificationProvider } from "./lib/notification-context";
import { LayoutProvider } from "./lib/layout-context";
import { useEffect } from "react";

// Import our pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import BusinessSignUpPage from "./pages/BusinessSignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import BusinessProfilePage from "./pages/BusinessProfilePage";
import BillingPage from "./pages/BillingPage";
import BrandingPage from "./pages/BrandingPage";
import SchedulePage from "./pages/SchedulePage";
import DailyShiftsPage from "./pages/DailyShiftsPage";
import EmployeesPage from "./pages/EmployeesPage";
import ShiftDetailsPage from "./pages/ShiftDetailsPage";
import EditShiftPage from "./pages/EditShiftPage";
import LocationsPage from "./pages/LocationsPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import EmployeeEarningsPage from "./pages/EmployeeEarningsPage";
import LocationDetailPage from "./pages/LocationDetailPage";
import LocationFinancialReportPage from "./pages/LocationFinancialReportPage";
import LocationShiftPage from "./pages/LocationShiftPage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { ShiftLogDetailsPage } from "./pages/ShiftLogDetailsPage";
import LocationEmployeesPage from "./pages/LocationEmployeesPage";
import LocationInsightsPage from "./pages/LocationInsightsPage";

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
			<NotificationProvider>
				<LayoutProvider>
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
							<Route
								path="/forgot-password"
								element={<ForgotPasswordPage />}
							/>
							<Route
								path="/reset-password"
								element={<ResetPasswordPage />}
							/>

							{/* Protected Routes */}
							<Route element={<ProtectedRoute />}>
								<Route element={<AppLayout />}>
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
										path="/schedule/monthly"
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
										path="/billing"
										element={<BillingPage />}
									/>
									<Route
										path="/branding"
										element={<BrandingPage />}
									/>
									<Route
										path="/employees"
										element={<EmployeesPage />}
									/>
									<Route
										path="/locations"
										element={<LocationsPage />}
									/>
									<Route
										path="/locations/:locationId"
										element={<LocationDetailPage />}
									/>
									<Route
										path="/locations/:locationId/insights"
										element={<LocationInsightsPage />}
									/>
									<Route
										path="/locations/:locationId/finance"
										element={<LocationFinancialReportPage />}
									/>
									<Route
										path="/locations/:locationId/shifts"
										element={<LocationShiftPage />}
									/>
									<Route
										path="/locations/:locationId/employees"
										element={<LocationEmployeesPage />}
									/>
									<Route
										path="/notifications"
										element={<NotificationsPage />}
									/>
									<Route
										path="/messages"
										element={<MessagesPage />}
									/>
									<Route
										path="/shifts"
										element={<ShiftsPage />}
									/>
									<Route
										path="/shift-details/:shiftId"
										element={<ShiftLogDetailsPage />}
									/>
									<Route
										path="/shifts/:shiftId"
										element={<ShiftDetailsPage />}
									/>
									<Route
										path="/edit-shift/:shiftId"
										element={<EditShiftPage />}
									/>
									<Route
										path="/employee-detail/:employeeId"
										element={<EmployeeDetailPage />}
									/>
									<Route
										path="/employee-earnings/:employeeId"
										element={<EmployeeEarningsPage />}
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
				</LayoutProvider>
			</NotificationProvider>
		</AuthProvider>
	);
}

export default App;
