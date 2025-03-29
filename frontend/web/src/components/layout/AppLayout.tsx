/*
 * AppLayout - Layout components for consistent page structure
 *
 * This file contains the new layout components that replace the older PageLayout components.
 * See the migration guide in docs/migration-guide-applayout.md for details on how to
 * migrate from PageLayout to these components.
 *
 * Components included:
 * - AppHeader - Header section with consistent styling
 * - AppTitle - Primary heading
 * - AppDescription - Supplementary text
 * - AppContent - Main content area
 * - AppFooter - Footer section
 */

import {
	Outlet,
	useLocation,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import {
	Sidebar,
	SidebarInset,
	SidebarProvider,
	useSidebar,
} from "../ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { OrganizationsAPI, Organization } from "../../api";
import { useLayout } from "../../lib/layout-context";
import { useAuth } from "../../lib/auth";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import * as React from "react";
import { cn } from "../../lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "../ui/card";

// Common props type for app layout components
type CommonProps = {
	children: React.ReactNode;
	className?: string;
};

// Layout content component that can access the sidebar context
function LayoutContent() {
	return (
		<SidebarInset>
			<main className="flex-1 overflow-auto w-full transition-all duration-200">
				<Outlet />
			</main>
		</SidebarInset>
	);
}

/**
 * AppHeader - Header section with consistent styling
 */
export function AppHeader({ children, className }: CommonProps) {
	return <CardHeader className={cn("mb-6", className)}>{children}</CardHeader>;
}

/**
 * AppTitle - Primary heading
 */
export function AppTitle({ children, className }: CommonProps) {
	return (
		<CardTitle className={cn("text-2xl font-bold tracking-tight", className)}>
			{children}
		</CardTitle>
	);
}

/**
 * AppDescription - Supplementary text that appears below the title
 */
export function AppDescription({ children, className }: CommonProps) {
	return (
		<CardDescription className={cn("mt-2", className)}>
			{children}
		</CardDescription>
	);
}

/**
 * AppContent - Main content area
 */
export function AppContent({ children, className }: CommonProps) {
	return (
		<CardContent className={cn("w-full", className)}>{children}</CardContent>
	);
}

/**
 * AppFooter - Footer section with consistent styling
 */
export function AppFooter({ children, className }: CommonProps) {
	return (
		<CardFooter className={cn("mt-8 pt-4 border-t", className)}>
			{children}
		</CardFooter>
	);
}

export default function AppLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const { pageHeader } = useLayout();
	const { signOut } = useAuth();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const organizationId = searchParams.get("organizationId") || "org-1";
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	// Pages with different layouts and actions
	const isCheckoutPage = location.pathname === "/checkout";
	const isLoginPage = location.pathname === "/login";
	const isMessagesPage = location.pathname === "/chat";
	const isSchedulePage = location.pathname === "/schedule";
	const isSchedulerPage = location.pathname.startsWith("/scheduler");
	const isShiftDetailsPage = location.pathname.match(/\/shifts\/(\w+)/);
	const isDailyShiftsPage = location.pathname === "/daily-shifts";
	const isEmployeesPage = location.pathname === "/employees";
	const isLocationsPage = location.pathname === "/locations";

	// Determines if the page should have a secondary sidebar
	const hasSecondarySidebar = isMessagesPage || isShiftDetailsPage;

	// Hide certain elements on auth pages

	// Check if we're on specific pages
	const isAdminDashboardPage = location.pathname === "/admin-dashboard";
	const isProfilePage = location.pathname === "/profile";
	const isBillingPage = location.pathname === "/billing";
	const isBrandingPage = location.pathname === "/branding";

	// Fetch organization
	useEffect(() => {
		const fetchOrganization = async () => {
			try {
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);
				}
			} catch (error) {
				console.error("Error fetching organization:", error);
			}
		};

		fetchOrganization();
	}, []);

	// Get date from URL param or use today's date
	useEffect(() => {
		if (location.pathname.startsWith("/daily-shifts")) {
			const dateParam = searchParams.get("date");
			if (dateParam) {
				setCurrentDate(new Date(dateParam));
			}
		}
	}, [searchParams, location.pathname]);

	const updateDate = (newDate: Date) => {
		setCurrentDate(newDate);
		setSearchParams({
			...Object.fromEntries(searchParams.entries()),
			date: newDate.toISOString().split("T")[0],
		});
	};

	const handleLogout = () => {
		signOut();
		navigate("/");
	};

	return (
		<SidebarProvider>
			<Sidebar className="w-64">
				<AppSidebar />
			</Sidebar>
			<LayoutContent />
			{/* Onboarding modal - shown globally for new users */}
			<OnboardingModal />
		</SidebarProvider>
	);
}
