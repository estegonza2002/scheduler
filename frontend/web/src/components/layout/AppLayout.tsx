import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
	LayoutDashboard,
	User,
	Calendar,
	Users,
	Building2,
	LogOut,
	Menu,
	X,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../../components/ui/tooltip";

interface NavItemProps {
	icon: React.ReactNode;
	label: string;
	href: string;
	isActive: boolean;
	onClick?: () => void;
	adminOnly?: boolean;
	isAdmin?: boolean;
	collapsed?: boolean;
	subItems?: NavItemProps[];
}

const NavItem = ({
	icon,
	label,
	href,
	isActive,
	onClick,
	adminOnly = false,
	isAdmin = false,
	collapsed = false,
	subItems,
}: NavItemProps) => {
	// Don't render admin-only items for non-admin users
	if (adminOnly && !isAdmin) return null;

	const content = (
		<Link
			to={href}
			onClick={onClick}
			className={cn(
				"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
				isActive
					? "bg-primary text-primary-foreground"
					: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
			)}>
			{icon}
			{!collapsed && <span>{label}</span>}
			{isActive && !collapsed && <ChevronRight className="ml-auto h-4 w-4" />}
		</Link>
	);

	if (collapsed) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>{content}</TooltipTrigger>
					<TooltipContent side="right">{label}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return content;
};

export default function AppLayout() {
	const { user, signOut } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	// Check if user is an admin (simple check for demo)
	const isAdmin = user?.user_metadata?.role === "admin";

	const handleSignOut = async () => {
		await signOut();
		navigate("/login");
	};

	const closeSidebar = () => {
		setSidebarOpen(false);
	};

	const toggleCollapsed = () => {
		setCollapsed(!collapsed);
	};

	const navItems = [
		{
			icon: <LayoutDashboard className="h-4 w-4" />,
			label: "Dashboard",
			href: isAdmin ? "/admin-dashboard" : "/dashboard",
			isActive:
				location.pathname === "/dashboard" ||
				location.pathname === "/admin-dashboard",
		},
		{
			icon: <Calendar className="h-4 w-4" />,
			label: "Schedule",
			href: `/daily-shifts?date=${new Date().toISOString().split("T")[0]}`,
			isActive:
				location.pathname === "/schedule" ||
				location.pathname.startsWith("/daily-shifts"),
			subItems: [
				{
					icon: <Calendar className="h-4 w-4" />,
					label: "Calendar View",
					href: "/schedule",
					isActive: location.pathname === "/schedule",
				},
			],
		},
		{
			icon: <Users className="h-4 w-4" />,
			label: "Employees",
			href: "/employees",
			isActive: location.pathname === "/employees",
			adminOnly: true,
		},
		{
			icon: <Building2 className="h-4 w-4" />,
			label: "Business Profile",
			href: "/business-profile",
			isActive: location.pathname === "/business-profile",
			adminOnly: true,
		},
	];

	return (
		<div className="flex h-full min-h-screen flex-col bg-background md:flex-row">
			{/* Mobile Sidebar Backdrop */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
					onClick={closeSidebar}
				/>
			)}

			{/* Sidebar */}
			<div
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 md:sticky md:top-0",
					collapsed ? "w-16" : "w-64",
					sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
				)}>
				<div className="flex h-16 items-center justify-between border-b px-4">
					{!collapsed && (
						<Link
							to="/"
							className="flex items-center gap-2">
							<Calendar className="h-6 w-6 text-primary" />
							<span className="text-lg font-semibold text-primary">
								Scheduler
							</span>
						</Link>
					)}
					{collapsed && (
						<Link
							to="/"
							className="mx-auto">
							<Calendar className="h-6 w-6 text-primary" />
						</Link>
					)}
					<div className="flex">
						<Button
							variant="ghost"
							size="icon"
							className="hidden md:flex"
							onClick={toggleCollapsed}
							aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
							{collapsed ? (
								<ChevronsRight className="h-4 w-4" />
							) : (
								<ChevronsLeft className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={closeSidebar}
							aria-label="Close sidebar">
							<X className="h-5 w-5" />
						</Button>
					</div>
				</div>

				<ScrollArea className="flex-1 py-2">
					<div className={cn("py-2", collapsed ? "px-2" : "px-3")}>
						{/* Navigation Menu */}
						<nav className="flex flex-col gap-1">
							{navItems.map((item, index) => (
								<div
									key={index}
									className="flex flex-col">
									<NavItem
										{...item}
										onClick={closeSidebar}
										adminOnly={item.adminOnly}
										isAdmin={isAdmin}
										collapsed={collapsed}
									/>

									{/* Render sub-items if the parent is active and not collapsed */}
									{item.isActive && item.subItems && !collapsed && (
										<div className="ml-7 mt-1 space-y-1">
											{item.subItems.map((subItem, subIndex) => (
												<NavItem
													key={`${index}-${subIndex}`}
													{...subItem}
													onClick={closeSidebar}
													isAdmin={isAdmin}
												/>
											))}
										</div>
									)}

									{/* Render sub-items if the parent is active and collapsed */}
									{item.isActive && item.subItems && collapsed && (
										<div className="mt-1 space-y-1">
											{item.subItems.map((subItem, subIndex) => (
												<NavItem
													key={`${index}-${subIndex}`}
													{...subItem}
													onClick={closeSidebar}
													isAdmin={isAdmin}
													collapsed={collapsed}
												/>
											))}
										</div>
									)}
								</div>
							))}
						</nav>

						<Separator className="my-4" />

						{/* User Info */}
						{!collapsed ? (
							<div className="mt-auto px-3 py-2">
								<Link
									to="/profile"
									className="block">
									<div className="flex items-center gap-3 rounded-md bg-muted p-3 hover:bg-muted/80 transition-colors">
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
											{user?.user_metadata?.firstName?.[0]}
											{user?.user_metadata?.lastName?.[0]}
										</div>
										<div className="flex flex-col overflow-hidden">
											<span className="truncate text-sm font-medium">
												{user?.user_metadata?.firstName}{" "}
												{user?.user_metadata?.lastName}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{user?.email}
											</span>
										</div>
									</div>
								</Link>

								<Button
									variant="outline"
									className="mt-3 w-full justify-start"
									onClick={handleSignOut}>
									<LogOut className="mr-2 h-4 w-4" />
									Sign Out
								</Button>
							</div>
						) : (
							<div className="mt-auto flex flex-col items-center gap-4 py-4">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link to="/profile">
												<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
													{user?.user_metadata?.firstName?.[0]}
													{user?.user_metadata?.lastName?.[0]}
												</div>
											</Link>
										</TooltipTrigger>
										<TooltipContent side="right">Profile</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="icon"
												onClick={handleSignOut}>
												<LogOut className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="right">Sign Out</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Main Content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Topbar */}
				<header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6">
					<Button
						variant="ghost"
						size="icon"
						className="mr-2 md:hidden"
						onClick={() => setSidebarOpen(true)}
						aria-label="Open sidebar">
						<Menu className="h-5 w-5" />
					</Button>

					<div className="ml-auto flex items-center gap-4">
						{isAdmin && (
							<span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
								Admin
							</span>
						)}
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
