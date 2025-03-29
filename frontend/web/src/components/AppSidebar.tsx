import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
	LayoutDashboard,
	Calendar,
	Users,
	Building2,
	MapPin,
	Bell,
	MessageSquare,
	CreditCard,
	Settings,
	LogOut,
	User,
	Sparkles,
	ClipboardList,
	Palette,
	BarChart3,
	TrendingUp,
	FileText,
	PieChart,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { OrganizationsAPI, type Organization } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Card, CardContent } from "@/components/ui/card";

type NavItem = {
	icon: React.ReactNode;
	label: string;
	href: string;
	isActive: boolean;
	adminOnly?: boolean;
	badge?: boolean;
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { user, signOut } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [subscriptionPlan, setSubscriptionPlan] = useState<
		"free" | "pro" | "business"
	>("free");
	// Add online status state (in a real app, this would come from a user status service)
	const [isOnline, setIsOnline] = useState(true);

	// Check if user is an admin
	const isAdmin = user?.user_metadata?.role === "admin";
	const isPaidUser = subscriptionPlan !== "free";

	// Helper function to check if a route is active
	const isRouteActive = (path: string): boolean => {
		// Handle paths without query parameters
		const currentPath = location.pathname;

		// Exact matches
		if (currentPath === path) return true;

		// Special case for nested routes - only match if the path is a prefix of the current path
		// and followed by a slash or end of string
		if (path !== "/" && currentPath.startsWith(path)) {
			// Check if the next character after the path is a slash or end of string
			const nextChar = currentPath.charAt(path.length);
			return nextChar === "/" || nextChar === "";
		}

		return false;
	};

	useEffect(() => {
		const fetchOrganizationData = async () => {
			try {
				// In a real implementation, this would fetch the organization by the user's organization_id
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);
					// In a real implementation, this would fetch the subscription plan from the organization data
					// For now, we'll assume the plan is "free"
					setSubscriptionPlan("free");
				}
			} catch (error) {
				console.error("Error fetching organization:", error);
			}
		};

		fetchOrganizationData();
	}, []);

	// Handle navigation for a menu item
	const handleNavigation = (href: string, event?: React.MouseEvent) => {
		// Prevent default if there's an event
		if (event) {
			event.preventDefault();
		}

		if (href === "#") {
			return; // This is for sign out, handled separately
		}

		// Use setTimeout to allow the event to complete before navigating
		setTimeout(() => {
			console.log("Navigating to:", href);

			// First, try using React Router's navigate
			navigate(href);

			// Set a fallback timeout in case navigate doesn't work
			// This happens in some versions of React Router
			const fallbackTimeout = setTimeout(() => {
				// Check if location didn't change
				if (location.pathname !== href.split("?")[0]) {
					console.log("Fallback navigation to:", href);
					window.location.href = href;
				}
			}, 100);

			// Clean up the timeout if component unmounts
			return () => clearTimeout(fallbackTimeout);
		}, 0);
	};

	// Handle profile click (replaces NavUser profile click functionality)
	const handleProfileClick = (e: React.MouseEvent) => {
		e.preventDefault();
		console.log("Navigating to profile");

		// Use setTimeout to allow the event to complete before navigating
		setTimeout(() => {
			// Try React Router navigation
			navigate("/profile");

			// Set a fallback timeout in case navigate doesn't work
			const fallbackTimeout = setTimeout(() => {
				console.log("Fallback navigation to profile");
				window.location.href = "/profile";
			}, 100);

			// Clean up timeout if component unmounts
			return () => clearTimeout(fallbackTimeout);
		}, 0);
	};

	const handleSignOut = () => {
		signOut();
	};

	// User display info directly in AppSidebar (formerly in NavUser)
	const userDisplay = {
		name: `${user?.user_metadata?.firstName || ""} ${
			user?.user_metadata?.lastName || ""
		}`,
		email: user?.email || "",
		avatar_url: user?.user_metadata?.avatar_url || "",
	};

	const mainNavItems: NavItem[] = [
		{
			icon: <LayoutDashboard className="h-5 w-5" />,
			label: "Dashboard",
			href: isAdmin ? "/admin-dashboard" : "/dashboard",
			isActive:
				isRouteActive("/dashboard") || isRouteActive("/admin-dashboard"),
		},
		{
			icon: <Calendar className="h-5 w-5" />,
			label: "Schedule",
			href: `/schedule?organizationId=${
				organization?.id || "org-1"
			}&scheduleId=sch-4`,
			isActive:
				isRouteActive("/schedule") ||
				isRouteActive("/schedule/monthly") ||
				isRouteActive("/daily-shifts"),
		},
		{
			icon: <Users className="h-5 w-5" />,
			label: "Employees",
			href: "/employees",
			isActive:
				isRouteActive("/employees") ||
				isRouteActive("/employee-") ||
				isRouteActive("/employee/"),
			adminOnly: true,
		},
		{
			icon: <MapPin className="h-5 w-5" />,
			label: "Locations",
			href: "/locations",
			isActive:
				isRouteActive("/locations") ||
				isRouteActive("/location-") ||
				isRouteActive("/location/"),
			adminOnly: true,
		},
	];

	// Personal section with My Shifts and My Locations
	const personalNavItems: NavItem[] = [
		{
			icon: <Building2 className="h-5 w-5" />,
			label: "Dashboard",
			href: isAdmin ? "/dashboard" : "/admin-dashboard",
			isActive: isAdmin
				? isRouteActive("/dashboard")
				: isRouteActive("/admin-dashboard"),
		},
		{
			icon: <ClipboardList className="h-5 w-5" />,
			label: "My Shifts",
			href: "/my-shifts",
			isActive: isRouteActive("/my-shifts"),
		},
		{
			icon: <MapPin className="h-5 w-5" />,
			label: "My Locations",
			href: "/my-locations",
			isActive: isRouteActive("/my-locations"),
		},
	];

	const communicationNavItems: NavItem[] = [
		{
			icon: <MessageSquare className="h-5 w-5" />,
			label: "Messages",
			href: "/messages",
			isActive: isRouteActive("/messages"),
		},
		{
			icon: <Bell className="h-5 w-5" />,
			label: "Notifications",
			href: "/notifications",
			isActive: isRouteActive("/notifications"),
			badge: true,
		},
	];

	// New user profile items
	const userProfileItems: NavItem[] = [
		{
			icon: <Palette className="h-5 w-5" />,
			label: "Design System",
			href: "/design-system",
			isActive: isRouteActive("/design-system"),
			adminOnly: true,
		},
	];

	// Add the billing/upgrade option separately so we can highlight it when it's an upgrade
	const billingItem: NavItem = {
		icon: isPaidUser ? (
			<CreditCard className="h-5 w-5" />
		) : (
			<Sparkles className="h-5 w-5 text-yellow-500" />
		),
		label: isPaidUser ? "Billing" : "Upgrade to Pro",
		href: isPaidUser ? "/billing" : "/pricing",
		isActive: isPaidUser
			? isRouteActive("/billing")
			: isRouteActive("/pricing"),
	};

	// Debug logs for avatar URL
	console.log("User in sidebar:", JSON.stringify(user, null, 2));
	console.log("User metadata in sidebar:", user?.user_metadata);
	console.log("Avatar URL in sidebar:", userDisplay.avatar_url);

	const renderMenuItems = (items: NavItem[], isFooterMenu = false) => {
		return items.map((item, index) => {
			// Don't render admin-only items for non-admin users
			if (item.adminOnly && !isAdmin) return null;

			return (
				<SidebarMenuItem
					key={index}
					className={isFooterMenu ? "px-0" : ""}>
					<SidebarMenuButton
						isActive={item.isActive}
						className={
							isFooterMenu ? "w-full rounded-none px-4 hover:bg-muted/80" : ""
						}
						onClick={(e) => handleNavigation(item.href, e)}>
						<div className="flex items-center justify-between w-full">
							<div className="flex items-center gap-3">
								{item.icon}
								<span>{item.label}</span>
							</div>
							{item.badge && (
								<Badge
									variant="secondary"
									className="ml-auto">
									New
								</Badge>
							)}
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			);
		});
	};

	const accountNavItem = {
		icon: <User className="h-5 w-5" />,
		label: "Account Settings",
		href: "/account",
		isActive: isRouteActive("/account"),
	};

	// Reports navigation items
	const reportsNavItems: NavItem[] = [
		{
			icon: <BarChart3 className="h-5 w-5" />,
			label: "Dashboard",
			href: "/reports",
			isActive: isRouteActive("/reports"),
			adminOnly: true,
		},
		{
			icon: <TrendingUp className="h-5 w-5" />,
			label: "Performance",
			href: "/reports/performance",
			isActive: isRouteActive("/reports/performance"),
			adminOnly: true,
		},
		{
			icon: <FileText className="h-5 w-5" />,
			label: "Attendance",
			href: "/reports/attendance",
			isActive: isRouteActive("/reports/attendance"),
			adminOnly: true,
		},
		{
			icon: <PieChart className="h-5 w-5" />,
			label: "Payroll",
			href: "/reports/payroll",
			isActive: isRouteActive("/reports/payroll"),
			adminOnly: true,
		},
	];

	// User profile
	const renderUserProfile = () => (
		<SidebarMenu className="px-2 pt-2 pb-1">
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="w-full rounded-md"
					onClick={handleProfileClick}>
					<AvatarWithStatus
						isOnline={isOnline}
						fallback={userDisplay.name.charAt(0)}
						src={userDisplay.avatar_url}
						alt={userDisplay.name}
						className="mr-2"
					/>
					<span className="flex-1 overflow-hidden text-left">
						<span className="block truncate font-medium">
							{userDisplay.name}
						</span>
						<span className="block truncate text-xs text-muted-foreground">
							{userDisplay.email}
						</span>
					</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className="w-full">
					{isAdmin ? (
						<div
							onClick={(e) => handleNavigation("/admin-dashboard", e)}
							className="flex items-center gap-3 px-4 py-2 rounded-md text-lg font-bold text-primary hover:bg-muted/50 transition-colors cursor-pointer">
							Scheduler
						</div>
					) : (
						<h2>Scheduler</h2>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Main</SidebarGroupLabel>
					<SidebarMenu>{renderMenuItems(mainNavItems)}</SidebarMenu>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup>
					<SidebarGroupLabel>Reports</SidebarGroupLabel>
					<SidebarMenu>{renderMenuItems(reportsNavItems)}</SidebarMenu>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup>
					<SidebarGroupLabel>Personal</SidebarGroupLabel>
					<SidebarMenu>{renderMenuItems(personalNavItems)}</SidebarMenu>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup>
					<SidebarGroupLabel>Communication</SidebarGroupLabel>
					<SidebarMenu>{renderMenuItems(communicationNavItems)}</SidebarMenu>
				</SidebarGroup>

				<SidebarSeparator />

				{/* Spacer to push content to bottom */}
				<div className="flex-grow" />
			</SidebarContent>

			<SidebarFooter className="pb-4">
				{/* User profile section directly in AppSidebar */}
				{renderUserProfile()}

				{/* Upgrade Banner */}
				{!isPaidUser && (
					<div className="px-2 pt-3 pb-2">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-2 mb-3">
									<Sparkles className="h-5 w-5 text-primary" />
									<h4 className="font-medium">Upgrade to Pro</h4>
								</div>
								<p className="text-xs text-muted-foreground mb-3">
									Get unlimited shifts, locations, and premium features.
								</p>
								<div
									onClick={(e) => handleNavigation("/pricing", e)}
									className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full cursor-pointer">
									See Plans
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				<SidebarSeparator className="my-2" />

				<SidebarMenu className="px-2">
					{isAdmin && (
						<SidebarMenuItem>
							<SidebarMenuButton
								className="w-full justify-start rounded-md text-sm py-2 hover:bg-muted"
								onClick={(e) => handleNavigation(accountNavItem.href, e)}>
								<div className="flex items-center gap-3">
									{accountNavItem.icon}
									<span>{accountNavItem.label}</span>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}

					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={handleSignOut}
							className="w-full justify-start rounded-md text-sm py-2 hover:bg-muted">
							<div className="flex items-center gap-3">
								<LogOut className="h-5 w-5" />
								<span>Sign Out</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
