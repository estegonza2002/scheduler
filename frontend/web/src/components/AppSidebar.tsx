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
} from "./ui/sidebar";
import { NavUser } from "./NavUser";
import { useState, useEffect } from "react";
import { OrganizationsAPI, type Organization } from "../api";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();
	const location = useLocation();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [subscriptionPlan, setSubscriptionPlan] = useState<
		"free" | "pro" | "business"
	>("free");

	// Check if user is an admin
	const isAdmin = user?.user_metadata?.role === "admin";

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

	const navItems = [
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
			isActive: location.pathname === "/employees",
			adminOnly: true,
		},
		{
			icon: <MapPin className="h-5 w-5" />,
			label: "Locations",
			href: "/locations",
			isActive: location.pathname === "/locations",
			adminOnly: true,
		},
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
		},
	];

	const userDisplay = {
		name: `${user?.user_metadata?.firstName || ""} ${
			user?.user_metadata?.lastName || ""
		}`,
		email: user?.email || "",
		avatar: user?.user_metadata?.avatar || "",
	};

	return (
		<>
			<SidebarHeader className="h-16 border-b border-sidebar-border">
				<div className="flex items-center gap-2 px-4 py-3">
					<Calendar className="h-5 w-5 text-primary" />
					<h2 className="text-lg font-semibold text-primary">Scheduler</h2>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu>
					{navItems.map((item, index) => {
						// Don't render admin-only items for non-admin users
						if (item.adminOnly && !isAdmin) return null;

						return (
							<SidebarMenuItem key={index}>
								<SidebarMenuButton
									asChild
									isActive={item.isActive}>
									<Link
										to={item.href}
										className="flex items-center gap-3">
										{item.icon}
										<span>{item.label}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter>
				<div className="p-4 border-t">
					<NavUser
						user={userDisplay}
						isAdmin={isAdmin}
						subscriptionPlan={subscriptionPlan}
					/>
				</div>
			</SidebarFooter>
		</>
	);
}
