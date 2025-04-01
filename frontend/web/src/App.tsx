import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import {
	OrganizationProvider,
	useOrganization,
} from "./lib/organization-context";
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
import { LoadingState } from "./components/ui/loading-state";

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
import MessagesPage from "./pages/MessagesPage";
import { ShiftLogDetailsPage } from "./pages/ShiftLogDetailsPage";
import LocationEmployeesPage from "./pages/LocationEmployeesPage";
import LocationInsightsPage from "./pages/LocationInsightsPage";
import DesignSystemShowcasePage from "./pages/DesignSystemShowcasePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ReportsPage from "./pages/ReportsPage";
import PricingPage from "./pages/PricingPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import AccountPage from "./pages/AccountPage";
import CreateShiftPage from "./pages/CreateShiftPage";
import ManageShiftsPage from "./pages/ManageShiftsPage";
import PastShiftsPage from "./pages/PastShiftsPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import CreateOrganizationPage from "./pages/CreateOrganizationPage";
import JoinOrganizationPage from "./pages/JoinOrganizationPage";
import OrganizationSelectionPage from "./pages/OrganizationSelectionPage";
import NoOrganizationPage from "./pages/NoOrganizationPage";
import SettingsPage from "./pages/SettingsPage";

// Marketing pages
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import EnterprisePage from "./pages/EnterprisePage";
import ResourcesPage from "./pages/ResourcesPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AboutPage from "./pages/AboutPage";
import DevelopersPage from "./pages/DevelopersPage";
import AllFeaturesPage from "./pages/AllFeaturesPage";
import ShiftSchedulingPage from "./pages/ShiftSchedulingPage";
import LeaveManagementPage from "./pages/LeaveManagementPage";
import AutoSchedulingPage from "./pages/AutoSchedulingPage";
import TaskManagementPage from "./pages/TaskManagementPage";
import ClockInOutPage from "./pages/ClockInOutPage";
import IntegrationsPage from "./pages/IntegrationsPage";

// Root redirect component that checks user role
interface RootRedirectProps {
	fallbackComponent: React.ReactNode;
}

function RootRedirect({ fallbackComponent }: RootRedirectProps) {
	const { user, isLoading } = useAuth();
	const { organizations, isLoading: isLoadingOrgs } = useOrganization();
	const [showBusinessSetup, setShowBusinessSetup] = useState(false);

	// Show loading state while checking auth and orgs
	if (isLoading || isLoadingOrgs) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingState
					message="Loading..."
					type="spinner"
				/>
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

	// If not logged in, show login page
	if (!user) {
		return fallbackComponent;
	}

	// If user has no organizations, redirect to no-organization page
	if (!isLoadingOrgs && (!organizations || organizations.length === 0)) {
		return (
			<Navigate
				to="/no-organization"
				replace
			/>
		);
	}

	// If user has multiple organizations, redirect to organization selection
	if (!isLoadingOrgs && organizations && organizations.length > 1) {
		return (
			<Navigate
				to="/organization-selection"
				replace
			/>
		);
	}

	// Check if user is an admin
	const isAdmin = user?.user_metadata?.role === "admin";
	return <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} />;
}

function App() {
	return (
		<AuthProvider>
			<OrganizationProvider>
				<HeaderProvider>
					<StripeProvider>
						<BrowserRouter>
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
									path="/forgot-password"
									element={<ForgotPasswordPage />}
								/>
								<Route
									path="/reset-password"
									element={<ResetPasswordPage />}
								/>

								{/* Protected routes */}
								<Route element={<ProtectedRoute />}>
									<Route
										path="/no-organization"
										element={<NoOrganizationPage />}
									/>
									<Route
										path="/create-organization"
										element={<CreateOrganizationPage />}
									/>
									<Route
										path="/join-organization"
										element={<JoinOrganizationPage />}
									/>
									<Route
										path="/organization-selection"
										element={<OrganizationSelectionPage />}
									/>
									<Route
										path="/role-selection"
										element={<RoleSelectionPage />}
									/>
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
											path="/account/*"
											element={<AccountPage />}
										/>
										<Route
											path="/users"
											element={<UsersManagementPage />}
										/>
										<Route
											path="/employees"
											element={<EmployeesPage />}
										/>
									</Route>
									<Route
										path="/"
										element={
											<RootRedirect
												fallbackComponent={<Navigate to="/login" />}
											/>
										}
									/>
								</Route>
							</Routes>
						</BrowserRouter>
					</StripeProvider>
				</HeaderProvider>
			</OrganizationProvider>
		</AuthProvider>
	);
}

export default App;
