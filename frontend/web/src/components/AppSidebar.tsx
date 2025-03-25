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
				location.pathname === "/dashboard" ||
				location.pathname === "/admin-dashboard",
		},
		{
			icon: <Calendar className="h-5 w-5" />,
			label: "Schedule",
			href: "/schedule",
			isActive:
				location.pathname === "/schedule" ||
				location.pathname === "/schedule/monthly" ||
				location.pathname.startsWith("/daily-shifts"),
		},
		{
			icon: <Users className="h-5 w-5" />,
			label: "Employees",
			href: "/employees",
			isActive:
				location.pathname === "/employees" ||
				location.pathname.startsWith("/employee/"),
			adminOnly: true,
		},
		{
			icon: <MapPin className="h-5 w-5" />,
			label: "Locations",
			href: "/locations",
			isActive:
				location.pathname === "/locations" ||
				location.pathname.startsWith("/location/"),
			adminOnly: true,
		},
	];

	const communicationNavItems: NavItem[] = [
		{
			icon: <MessageSquare className="h-5 w-5" />,
			label: "Messages",
			href: "/messages",
			isActive: location.pathname === "/messages",
		},
		{
			icon: <Bell className="h-5 w-5" />,
			label: "Notifications",
			href: "/notifications",
			isActive: location.pathname === "/notifications",
			badge: true,
		},
	];

	const settingsNavItems: NavItem[] = [
		{
			icon: <CreditCard className="h-5 w-5" />,
			label: "Billing",
			href: "/billing",
			isActive: location.pathname === "/billing",
			adminOnly: true,
		},
		{
			icon: <Settings className="h-5 w-5" />,
			label: "Settings",
			href: "/profile",
			isActive:
				location.pathname === "/profile" ||
				location.pathname === "/business-profile",
		},
	];

	// New user profile items
	const userProfileItems: NavItem[] = [
		{
			icon: <User className="h-5 w-5" />,
			label: "Profile",
			href: "/profile",
			isActive: location.pathname === "/profile",
		},
		{
			icon: <Building2 className="h-5 w-5" />,
			label: "Business Profile",
			href: "/business-profile",
			isActive: location.pathname === "/business-profile",
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
		isActive: location.pathname === "/billing",
	};

	const userDisplay = {
		name: `${user?.user_metadata?.firstName || ""} ${
			user?.user_metadata?.lastName || ""
		}`,
		email: user?.email || "",
		avatar: user?.user_metadata?.avatar || "",
	};

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
			<SidebarHeader className="h-16">
				<div className="flex items-center px-4 py-3">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-primary">Scheduler</h2>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent className="pb-0">
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

				<SidebarGroup>
					<SidebarGroupLabel>Settings</SidebarGroupLabel>
					<SidebarMenu>{renderMenuItems(settingsNavItems)}</SidebarMenu>
				</SidebarGroup>

				{/* Spacer to push content to bottom */}
				<div className="flex-grow" />

				{/* Upgrade Banner */}
				{!isPaidUser && (
					<div className="px-4 py-3 mt-auto">
						<div className="rounded-lg border bg-card text-card-foreground shadow">
							<div className="p-4">
								<div className="flex items-center gap-2 mb-2">
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

			{/* Border that stretches to the edges */}
			<div className="h-px w-full bg-border"></div>

			<SidebarFooter className="pt-0 bg-muted">
				<div>
					{/* User profile section */}
					<div>
						<div className="py-3">
							<div className="flex items-center gap-3 px-4 mb-3">
								<div className="relative">
									<Avatar className="h-10 w-10 rounded-lg border border-border">
										<AvatarImage
											src={userDisplay.avatar}
											alt={userDisplay.name}
										/>
										<AvatarFallback className="rounded-lg">
											{userDisplay.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									{/* Online status indicator */}
									<span
										className={`absolute top-0 right-0 translate-x-1 -translate-y-1 block h-3 w-3 rounded-full border-2 border-background ${
											isOnline ? "bg-green-500" : "bg-gray-400"
										}`}></span>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{userDisplay.name}
									</span>
									<span className="truncate text-xs">{userDisplay.email}</span>
								</div>
							</div>

							{/* User profile menu items */}
							<SidebarMenu className="px-0">
								{renderMenuItems(userProfileItems, true)}
								{isPaidUser && renderMenuItems([billingItem], true)}
								<SidebarMenuItem className="px-0">
									<SidebarMenuButton
										onClick={handleSignOut}
										className="w-full rounded-none px-4 hover:bg-muted/80">
										<div className="flex items-center gap-3">
											<LogOut className="h-5 w-5" />
											<span>Log out</span>
										</div>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</div>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
