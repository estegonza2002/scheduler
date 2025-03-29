import * as React from "react";
import { Link, useLocation } from "react-router-dom";
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
import { NavUser } from "@/components/NavUser";
import { useState, useEffect } from "react";
import { OrganizationsAPI, type Organization } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
		// Exact matches
		if (location.pathname === path) return true;

		// Special case for nested routes - only match if the path is a prefix of the current path
		// and followed by a slash or end of string
		if (path !== "/" && location.pathname.startsWith(path)) {
			// Check if the next character after the path is a slash or end of string
			const nextChar = location.pathname.charAt(path.length);
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
			href: "/schedule",
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

	const userDisplay = {
		name: `${user?.user_metadata?.firstName || ""} ${
			user?.user_metadata?.lastName || ""
		}`,
		email: user?.email || "",
		avatar_url: user?.user_metadata?.avatar_url || "",
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
						asChild
						isActive={item.isActive}
						className={
							isFooterMenu ? "w-full rounded-none px-4 hover:bg-muted/80" : ""
						}>
						<Link
							to={item.href}
							className="flex items-center justify-between w-full">
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
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			);
		});
	};

	const handleSignOut = () => {
		signOut();
	};

	// Add new Reports navigation items
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

	// Replace accountNavItem with a single Account entry
	const accountNavItem: NavItem = {
		icon: <Settings className="h-5 w-5" />,
		label: "Account",
		href: "/account",
		isActive: isRouteActive("/account"),
		adminOnly: true,
	};

	// Sign out item for the footer
	const signOutItem: NavItem = {
		icon: <LogOut className="h-5 w-5" />,
		label: "Sign Out",
		href: "#",
		isActive: false,
	};

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className="w-full">
					{isAdmin ? (
						<Link
							to="/admin-dashboard"
							className="flex items-center gap-3 px-4 py-2 rounded-md text-lg font-bold text-primary hover:bg-muted/50 transition-colors ">
							Scheduler
						</Link>
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
				{/* User profile section using NavUser component */}
				<NavUser
					user={userDisplay}
					isAdmin={isAdmin}
					subscriptionPlan={subscriptionPlan}
					isOnline={isOnline}
				/>

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
								<Link
									to="/pricing"
									className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full">
									See Plans
								</Link>
							</CardContent>
						</Card>
					</div>
				)}

				<SidebarSeparator className="my-2" />

				<SidebarMenu className="px-2">
					{isAdmin && (
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="w-full justify-start rounded-md text-sm py-2 hover:bg-muted">
								<Link
									to={accountNavItem.href}
									className="flex items-center gap-3">
									{accountNavItem.icon}
									<span>{accountNavItem.label}</span>
								</Link>
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
