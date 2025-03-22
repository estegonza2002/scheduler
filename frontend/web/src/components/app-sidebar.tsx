import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
	LayoutDashboard,
	Calendar,
	Users,
	Building2,
	User,
	LogOut,
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
import { Button } from "./ui/button";
import { MiniCalendar } from "./MiniCalendar";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user, signOut } = useAuth();
	const location = useLocation();

	// Check if user is an admin
	const isAdmin = user?.user_metadata?.role === "admin";

	const handleSignOut = () => {
		signOut();
	};

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
				location.pathname.startsWith("/daily-shifts"),
		},
		{
			icon: <Users className="h-5 w-5" />,
			label: "Employees",
			href: "/employees",
			isActive: location.pathname === "/employees",
			adminOnly: true,
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
				{/* Mini Calendar at the top */}
				<div className="w-full">
					<MiniCalendar />
				</div>

				<SidebarSeparator className="mx-0 my-2" />

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
					<div className="flex items-center gap-3 mb-4">
						<NavUser user={userDisplay} />
					</div>

					<div className="space-y-2">
						<Button
							variant="outline"
							className="w-full justify-start"
							asChild>
							<Link to="/profile">
								<User className="mr-2 h-4 w-4" />
								Profile
							</Link>
						</Button>

						{isAdmin && (
							<Button
								variant="outline"
								className="w-full justify-start"
								asChild>
								<Link to="/business-profile">
									<Building2 className="mr-2 h-4 w-4" />
									Business Profile
								</Link>
							</Button>
						)}

						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={handleSignOut}>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</Button>
					</div>
				</div>
			</SidebarFooter>
		</>
	);
}
