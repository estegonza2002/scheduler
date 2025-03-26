import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
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
} from "./ui/sidebar";
import { NavUser } from "./NavUser";
import { useState, useEffect } from "react";
import { OrganizationsAPI, type Organization } from "../api";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

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
			icon: <Building2 className="h-5 w-5" />,
			label: isAdmin ? "Employee Dashboard" : "Business Dashboard",
			href: isAdmin ? "/dashboard" : "/admin-dashboard",
			isActive: isAdmin
				? isRouteActive("/dashboard")
				: isRouteActive("/admin-dashboard"),
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
			icon: <ClipboardList className="h-5 w-5" />,
			label: "Shifts",
			href: "/shifts",
			isActive:
				isRouteActive("/shifts") ||
				isRouteActive("/shift-details") ||
				isRouteActive("/shift-") ||
				isRouteActive("/edit-shift"),
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
		href: "/billing",
		isActive: isRouteActive("/billing"),
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

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className="w-full">
					{isAdmin ? (
						<Link
							to="/business-profile"
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
					<SidebarGroupLabel>Communication</SidebarGroupLabel>
					<SidebarMenu>{renderMenuItems(communicationNavItems)}</SidebarMenu>
				</SidebarGroup>

				<SidebarSeparator />

				{/* Spacer to push content to bottom */}
				<div className="flex-grow" />

				{/* Upgrade Banner */}
				{!isPaidUser && (
					<div className="px-2 mt-auto">
						<div className="rounded-lg border bg-card text-card-foreground shadow">
							<div className="p-4">
								<div className="flex items-center gap-2 mb-3">
									<Sparkles className="h-5 w-5 text-primary" />
									<h4 className="font-medium">Upgrade to Pro</h4>
								</div>
								<p className="text-xs text-muted-foreground mb-3">
									Get unlimited shifts, locations, and premium features.
								</p>
								<Link
									to="/billing"
									className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full">
									Upgrade
								</Link>
							</div>
						</div>
					</div>
				)}
			</SidebarContent>

			<SidebarFooter>
				{/* User profile section using NavUser component */}
				<NavUser
					user={userDisplay}
					isAdmin={isAdmin}
					subscriptionPlan={subscriptionPlan}
					isOnline={isOnline}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
