import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { OrganizationProvider } from "./lib/organization";
import { StripeProvider } from "./lib/stripe";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { NotificationProvider } from "./lib/notification-context";
import { LayoutProvider } from "./lib/layout-context";
import { OnboardingProvider } from "./lib/onboarding-context";
import { useEffect, useState } from "react";
import { BusinessSetupModal } from "./components/auth/BusinessSetupModal";
import { LocationProvider } from "./lib/location";
import { EmployeeProvider } from "./lib/employee";
import { ShiftProvider } from "./lib/shift";

// Import our pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import BusinessSignUpPage from "./pages/BusinessSignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import BusinessProfilePage from "./pages/BusinessProfilePage";
import BillingPage from "./pages/BillingPage";
import BrandingPage from "./pages/BrandingPage";
import SchedulePage from "./pages/SchedulePage";
import DailyShiftsPage from "./pages/DailyShiftsPage";
import MyShiftsPage from "./pages/MyShiftsPage";
import MyLocationsPage from "./pages/MyLocationsPage";
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
import { ShiftLogDetailsPage } from "./pages/ShiftLogDetailsPage";
import LocationEmployeesPage from "./pages/LocationEmployeesPage";
import LocationInsightsPage from "./pages/LocationInsightsPage";
import DesignSystemShowcasePage from "./pages/DesignSystemShowcasePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ReportsPage from "./pages/ReportsPage";
import PricingPage from "./pages/PricingPage";

// Root redirect component that checks user role
function RootRedirect() {
	const { user, isLoading } = useAuth();
	const [showBusinessSetup, setShowBusinessSetup] = useState(false);

	useEffect(() => {
		// Check if this is a Google sign-in for business registration
		if (user && localStorage.getItem("business_signup") === "true") {
			setShowBusinessSetup(true);
		}
	}, [user]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Show business setup modal if needed
	if (showBusinessSetup) {
		return (
			<>
				<BusinessSetupModal
					isOpen={showBusinessSetup}
					onClose={() => {
						setShowBusinessSetup(false);
						localStorage.removeItem("business_signup");
					}}
				/>
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-2xl font-semibold mb-2">
							Complete Your Business Setup
						</h2>
						<p className="text-muted-foreground">
							Please provide your business details to complete registration.
						</p>
					</div>
				</div>
			</>
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
		<Router>
			<AuthProvider>
				<OrganizationProvider>
					<LocationProvider>
						<EmployeeProvider>
							<ShiftProvider>
								<StripeProvider>
									<LayoutProvider>
										<NotificationProvider>
											<OnboardingProvider>
												<Routes>
													{/* Public routes */}
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
													<Route
														path="/auth-callback"
														element={<AuthCallbackPage />}
													/>
													<Route
														path="/terms"
														element={<TermsPage />}
													/>
													<Route
														path="/privacy"
														element={<PrivacyPage />}
													/>
													<Route
														path="/pricing"
														element={<PricingPage />}
													/>

													{/* Protected routes */}
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
																path="/my-shifts"
																element={<MyShiftsPage />}
															/>
															<Route
																path="/my-locations"
																element={<MyLocationsPage />}
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
																path="/employees/:employeeId"
																element={<EmployeeDetailPage />}
															/>
															<Route
																path="/employees/:employeeId/earnings"
																element={<EmployeeEarningsPage />}
															/>
															<Route
																path="/shifts/new"
																element={<EditShiftPage />}
															/>
															<Route
																path="/shifts/:shiftId"
																element={<ShiftDetailsPage />}
															/>
															<Route
																path="/shifts/:shiftId/edit"
																element={<EditShiftPage />}
															/>
															<Route
																path="/shift-logs/:logId"
																element={<ShiftLogDetailsPage />}
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
																path="/design-system"
																element={<DesignSystemShowcasePage />}
															/>

															{/* Reports Routes */}
															<Route
																path="/reports"
																element={<ReportsPage />}
															/>
															<Route
																path="/reports/performance"
																element={<ReportsPage />}
															/>
															<Route
																path="/reports/attendance"
																element={<ReportsPage />}
															/>
															<Route
																path="/reports/payroll"
																element={<ReportsPage />}
															/>
														</Route>
													</Route>

													{/* Root redirect */}
													<Route
														path="/"
														element={<RootRedirect />}
													/>
													<Route
														path="*"
														element={
															<Navigate
																to="/"
																replace
															/>
														}
													/>
												</Routes>
											</OnboardingProvider>
										</NotificationProvider>
									</LayoutProvider>
								</StripeProvider>
							</ShiftProvider>
						</EmployeeProvider>
					</LocationProvider>
				</OrganizationProvider>
			</AuthProvider>
		</Router>
	);
}

export default App;
