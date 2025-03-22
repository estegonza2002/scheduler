import { Outlet, useLocation } from "react-router-dom";
import {
	Sidebar,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { AppSidebar } from "../app-sidebar";

export default function AppLayoutNew() {
	const location = useLocation();

	// Function to determine the current page title based on route
	const getPageTitle = () => {
		const path = location.pathname;
		if (path === "/dashboard" || path === "/admin-dashboard")
			return "Dashboard";
		if (path === "/schedule") return "Schedule";
		if (path.startsWith("/daily-shifts")) return "Daily Shifts";
		if (path === "/employees") return "Employees";
		if (path === "/business-profile") return "Business Profile";
		if (path === "/profile") return "Profile";
		return "Scheduler";
	};

	return (
		<SidebarProvider>
			<Sidebar className="w-64">
				<AppSidebar />
			</Sidebar>
			<SidebarInset>
				<header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 h-4"
					/>
					<div className="text-lg font-semibold">{getPageTitle()}</div>
				</header>
				<main className="flex-1 overflow-auto">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
