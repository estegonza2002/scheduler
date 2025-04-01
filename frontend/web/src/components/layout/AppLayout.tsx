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
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { HeaderProvider, useHeader } from "../../lib/header-context";
import { SidebarTrigger } from "../ui/sidebar";

// Common props type for app layout components
type CommonProps = {
	children: React.ReactNode;
	className?: string;
};

// Global header component that uses the HeaderContext
function GlobalHeader() {
	const { headerContent } = useHeader();
	const { toggleSidebar: toggleSidebarInternal } = useSidebar();
	const navigate = useNavigate();
	const location = useLocation();

	// List of top-level pages that shouldn't show a back button
	const TOP_LEVEL_PAGES = [
		"/dashboard",
		"/admin-dashboard",
		"/daily-shifts",
		"/employees",
		"/locations",
		"/shifts",
		"/profile",
		"/business-profile",
		"/billing",
		"/branding",
		"/notifications",
		"/messages",
		"/reports",
		"/my-shifts",
	];

	// Determine if current page should show back button
	const isTopLevelPage = TOP_LEVEL_PAGES.some(
		(path) =>
			location.pathname === path || location.pathname.startsWith(`${path}/`)
	);

	// Use explicit showBackButton from header content if provided, otherwise determine based on page
	const shouldShowBackButton =
		headerContent.showBackButton === true ||
		(headerContent.showBackButton !== false && !isTopLevelPage);

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<header className="sticky top-0 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 z-40">
			<div className="flex flex-1 items-center">
				<div className="flex items-center gap-2">
					<SidebarTrigger
						className="-ml-1"
						onClick={(e) => {
							e.stopPropagation();
							toggleSidebarInternal();
						}}
					/>
					{shouldShowBackButton && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleGoBack}
							className="h-8 w-8"
							title="Go back">
							<ChevronLeft className="h-5 w-5" />
						</Button>
					)}
				</div>
				<div className="mx-4">
					<h1 className="text-lg font-semibold">{headerContent.title}</h1>
					{headerContent.description && (
						<p className="text-xs text-muted-foreground">
							{headerContent.description}
						</p>
					)}
				</div>
			</div>
			{headerContent.actions && (
				<div className="flex items-center justify-end gap-3">
					{headerContent.actions}
				</div>
			)}
		</header>
	);
}

// Layout content component that can access the sidebar context
function LayoutContent() {
	return (
		<SidebarInset>
			<div className="flex flex-col h-full">
				<GlobalHeader />
				<main className="flex-1 overflow-auto w-full transition-all duration-200">
					<Outlet />
				</main>
			</div>
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
	const { signOut } = useAuth();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const organizationId = searchParams.get("organizationId") || "org-1";
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	// Read sidebar state from cookie or default to expanded
	const [defaultSidebarOpen, setDefaultSidebarOpen] = useState(() => {
		const sidebarCookie = document.cookie
			.split("; ")
			.find((row) => row.startsWith("sidebar_state="));
		return sidebarCookie ? sidebarCookie.split("=")[1] === "true" : true;
	});

	// Pages with different layouts and actions
	const isCheckoutPage = location.pathname === "/checkout";
	const isLoginPage = location.pathname === "/login";
	const isMessagesPage = location.pathname === "/messages";
	const isSchedulerPage = location.pathname.startsWith("/scheduler");
	const isShiftDetailsPage = location.pathname.match(/\/shifts\/(\w+)/);
	const isDailyShiftsPage = location.pathname === "/daily-shifts";

	// Determines if the page should have a secondary sidebar
	const hasSecondarySidebar = isMessagesPage || isShiftDetailsPage;

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
		<HeaderProvider>
			<SidebarProvider defaultOpen={defaultSidebarOpen}>
				<Sidebar className="w-64">
					<AppSidebar />
				</Sidebar>
				<LayoutContent />
				{/* Onboarding modal - shown globally for new users */}
				<OnboardingModal />
			</SidebarProvider>
		</HeaderProvider>
	);
}
