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
import MarketingLayout from "./components/layout/MarketingLayout";
import { NotificationProvider } from "./lib/notification-context";
import { OnboardingProvider } from "./lib/onboarding-context";
import { useEffect, useState } from "react";
import { BusinessSetupModal } from "./components/auth/BusinessSetupModal";
import { LocationProvider } from "./lib/location";
import { EmployeeProvider } from "./lib/employee";
import { ShiftProvider } from "./lib/shift";
import { Button } from "./components/ui/button";
import { HeaderProvider } from "./lib/header-context";

// Import our pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import BusinessSignUpPage from "./pages/BusinessSignUpPage";
import AccountTypePage from "./pages/AccountTypePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import LogoutPage from "./pages/LogoutPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import BusinessProfilePage from "./pages/BusinessProfilePage";
import BillingPage from "./pages/BillingPage";
import BrandingPage from "./pages/BrandingPage";
import DailyShiftsPage from "./pages/DailyShiftsPage";
import MyShiftsPage from "./pages/MyShiftsPage";
import MyLocationsPage from "./pages/MyLocationsPage";
import EmployeesPage from "./pages/EmployeesPage";
import ShiftDetailsPage from "./pages/ShiftDetailsPage";
import EditShiftPage from "./pages/EditShiftPage";
import LocationsPage from "./pages/LocationsPage";
import BulkLocationImportPage from "./pages/BulkLocationImportPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import LocationDetailPage from "./pages/LocationDetailPage";
import LocationFinancialReportPage from "./pages/LocationFinancialReportPage";
import LocationShiftPage from "./pages/LocationShiftPage";
import NotificationsPage from "./pages/NotificationsPage";
import { ShiftLogDetailsPage } from "./pages/ShiftLogDetailsPage";
import LocationEmployeesPage from "./pages/LocationEmployeesPage";
import LocationInsightsPage from "./pages/LocationInsightsPage";
import DesignSystemShowcasePage from "./pages/DesignSystemShowcasePage";
import TermsPage from "./pages/marketing/TermsPage";
import PrivacyPage from "./pages/marketing/PrivacyPage";
import ReportsPage from "./pages/ReportsPage";
import PricingPage from "./pages/marketing/PricingPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import AccountPage from "./pages/AccountPage";
import CreateShiftPage from "./pages/CreateShiftPage";
import ManageShiftsPage from "./pages/ManageShiftsPage";
import PastShiftsPage from "./pages/PastShiftsPage";

// Marketing pages
import HomePage from "./pages/marketing/HomePage";
import FeaturesPage from "./pages/marketing/FeaturesPage";
import EnterprisePage from "./pages/marketing/EnterprisePage";
import ResourcesPage from "./pages/marketing/ResourcesPage";
import ContactPage from "./pages/marketing/ContactPage";
import BlogPage from "./pages/marketing/BlogPage";
import BlogPostPage from "./pages/marketing/BlogPostPage";
import AboutPage from "./pages/marketing/AboutPage";
import DevelopersPage from "./pages/marketing/DevelopersPage";
import AllFeaturesPage from "./pages/marketing/AllFeaturesPage";
import ShiftSchedulingPage from "./pages/marketing/ShiftSchedulingPage";
import LeaveManagementPage from "./pages/marketing/LeaveManagementPage";
import AutoSchedulingPage from "./pages/marketing/AutoSchedulingPage";
import TaskManagementPage from "./pages/marketing/TaskManagementPage";
import ClockInOutPage from "./pages/marketing/ClockInOutPage";
import IntegrationsPage from "./pages/marketing/IntegrationsPage";

// Root redirect component that checks user role
interface RootRedirectProps {
	fallbackComponent: React.ReactNode;
}

function RootRedirect({ fallbackComponent }: RootRedirectProps) {
	const { user, isLoading } = useAuth();
	const [showBusinessSetup, setShowBusinessSetup] = useState(false);
	const [loadingTimeout, setLoadingTimeout] = useState(false);

	useEffect(() => {
		// Check if this is a Google sign-in for business registration
		if (user && localStorage.getItem("business_signup") === "true") {
			setShowBusinessSetup(true);
		}

		// Set a timeout to avoid infinite loading state
		const timeoutId = setTimeout(() => {
			if (isLoading) {
				console.warn("Loading timeout in RootRedirect");
				setLoadingTimeout(true);
			}
		}, 8000); // 8 seconds timeout

		return () => clearTimeout(timeoutId);
	}, [user, isLoading]);

	if (isLoading && !loadingTimeout) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// If we hit a timeout but are still loading, show a retry button
	if (loadingTimeout && isLoading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-2">Connection Issue</h2>
					<p className="text-muted-foreground mb-4">
						We're having trouble connecting to our servers. This might be due to
						network issues.
					</p>
					<Button onClick={() => window.location.reload()}>
						Retry Connection
					</Button>
				</div>
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
		return fallbackComponent;
	}

	// Check if user is an admin
	const isAdmin = user?.user_metadata?.role === "admin";
	return <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} />;
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<Routes>
					{/* Marketing pages - accessible without login */}
					<Route element={<MarketingLayout />}>
						<Route
							path="/"
							element={<RootRedirect fallbackComponent={<HomePage />} />}
						/>
						{/* Marketing routes */}
						<Route
							path="/features"
							element={<FeaturesPage />}
						/>
						<Route
							path="/features/all"
							element={<AllFeaturesPage />}
						/>
						<Route
							path="/features/shift-scheduling"
							element={<ShiftSchedulingPage />}
						/>
						<Route
							path="/features/leave-management"
							element={<LeaveManagementPage />}
						/>
						<Route
							path="/features/auto-scheduling"
							element={<AutoSchedulingPage />}
						/>
						<Route
							path="/features/task-management"
							element={<TaskManagementPage />}
						/>
						<Route
							path="/features/clock-in-out"
							element={<ClockInOutPage />}
						/>
						<Route
							path="/integrations"
							element={<IntegrationsPage />}
						/>
						<Route
							path="/pricing"
							element={<PricingPage />}
						/>
						<Route
							path="/enterprise"
							element={<EnterprisePage />}
						/>
						<Route
							path="/resources"
							element={<ResourcesPage />}
						/>
						<Route
							path="/contact"
							element={<ContactPage />}
						/>
						<Route
							path="/blog"
							element={<BlogPage />}
						/>
						<Route
							path="/blog/:postId"
							element={<BlogPostPage />}
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
							path="/about"
							element={<AboutPage />}
						/>
						<Route
							path="/developers"
							element={<DevelopersPage />}
						/>
					</Route>

					{/* Authentication pages - not wrapped in data providers */}
					<Route
						path="/signup"
						element={<SignUpPage />}
					/>
					<Route
						path="/business-signup"
						element={<BusinessSignUpPage />}
					/>
					<Route
						path="/account-type"
						element={<AccountTypePage />}
					/>
					<Route
						path="/login"
						element={<LoginPage />}
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
						path="/logout"
						element={<LogoutPage />}
					/>

					{/* Protected routes - wrapped in data providers */}
					<Route
						element={
							<ProtectedRoute>
								<OrganizationProvider>
									<LocationProvider>
										<EmployeeProvider>
											<ShiftProvider>
												<StripeProvider>
													<HeaderProvider>
														<NotificationProvider>
															<OnboardingProvider>
																<AppLayout />
															</OnboardingProvider>
														</NotificationProvider>
													</HeaderProvider>
												</StripeProvider>
											</ShiftProvider>
										</EmployeeProvider>
									</LocationProvider>
								</OrganizationProvider>
							</ProtectedRoute>
						}>
						{/* Dashboard routes */}
						<Route
							path="/dashboard"
							element={<DashboardPage />}
						/>
						<Route
							path="/admin-dashboard"
							element={<AdminDashboardPage />}
						/>

						{/* Profile routes */}
						<Route
							path="/profile"
							element={<ProfilePage />}
						/>
						<Route
							path="/business-profile"
							element={<BusinessProfilePage />}
						/>
						<Route
							path="/account"
							element={<AccountPage />}
						/>
						<Route
							path="/billing"
							element={<BillingPage />}
						/>
						<Route
							path="/branding"
							element={<BrandingPage />}
						/>

						{/* Shifts routes */}
						<Route
							path="/daily-shifts"
							element={<DailyShiftsPage />}
						/>
						<Route
							path="/my-shifts"
							element={<MyShiftsPage />}
						/>
						<Route
							path="/create-shift"
							element={<CreateShiftPage />}
						/>
						<Route
							path="/manage-shifts"
							element={<ManageShiftsPage />}
						/>
						<Route
							path="/past-shifts"
							element={<PastShiftsPage />}
						/>
						<Route
							path="/shift/:shiftId"
							element={<ShiftDetailsPage />}
						/>
						<Route
							path="/shift/:shiftId/edit"
							element={<EditShiftPage />}
						/>
						<Route
							path="/shift-log/:logId"
							element={<ShiftLogDetailsPage />}
						/>

						{/* Location routes */}
						<Route
							path="/locations"
							element={<LocationsPage />}
						/>
						<Route
							path="/my-locations"
							element={<MyLocationsPage />}
						/>
						<Route
							path="/location/:locationId"
							element={<LocationDetailPage />}
						/>
						<Route
							path="/location/:locationId/shifts"
							element={<LocationShiftPage />}
						/>
						<Route
							path="/location/:locationId/financial"
							element={<LocationFinancialReportPage />}
						/>
						<Route
							path="/location/:locationId/employees"
							element={<LocationEmployeesPage />}
						/>
						<Route
							path="/location/:locationId/insights"
							element={<LocationInsightsPage />}
						/>
						<Route
							path="/bulk-location-import"
							element={<BulkLocationImportPage />}
						/>

						{/* Employees routes */}
						<Route
							path="/employees"
							element={<EmployeesPage />}
						/>
						<Route
							path="/employee/:employeeId"
							element={<EmployeeDetailPage />}
						/>

						{/* Admin routes */}
						<Route
							path="/users"
							element={<UsersManagementPage />}
						/>

						{/* Other routes */}
						<Route
							path="/notifications"
							element={<NotificationsPage />}
						/>
						<Route
							path="/reports"
							element={<ReportsPage />}
						/>
						<Route
							path="/design-system"
							element={<DesignSystemShowcasePage />}
						/>
					</Route>

					{/* Catch-all route */}
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
			</AuthProvider>
		</Router>
	);
}

export default App;
