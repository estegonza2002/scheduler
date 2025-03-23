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
	SidebarTrigger,
} from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { AppSidebar } from "../app-sidebar";
import { Button } from "../ui/button";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Plus,
	Grid,
} from "lucide-react";
import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { ShiftCreationDialog } from "../ShiftCreationDialog";

export default function AppLayoutNew() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const organizationId = searchParams.get("organizationId") || "org-1";

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

	// Function to determine the current page title based on route
	const getPageTitle = () => {
		const path = location.pathname;
		if (path === "/dashboard" || path === "/admin-dashboard")
			return "Dashboard";
		if (path === "/schedule") return "Schedule";
		if (path.startsWith("/daily-shifts")) return "Daily Shifts";
		if (path === "/employees") return "Employees";
		if (path === "/locations") return "Locations";
		if (path === "/business-profile") return "Business Profile";
		if (path === "/profile") return "Profile";
		return "Scheduler";
	};

	// Check if we're on the daily shifts page
	const isDailyShiftsPage = location.pathname.startsWith("/daily-shifts");

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
					<div className="flex-1 flex items-center gap-3">
						<div className="text-lg font-semibold">{getPageTitle()}</div>
					</div>

					{isDailyShiftsPage && (
						<ShiftCreationDialog
							scheduleId="sch-4"
							organizationId={organizationId}
							initialDate={currentDate}
							onShiftCreated={() => {}}
							trigger={
								<Button
									variant="default"
									className="bg-black hover:bg-black/90 text-white">
									<Plus className="h-4 w-4 mr-2" />
									New Shift
								</Button>
							}
						/>
					)}
				</header>
				<main className="flex-1 overflow-auto mx-auto w-full">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
