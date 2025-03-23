import {
	Outlet,
	useLocation,
	useNavigate,
	useSearchParams,
	Link,
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
	User,
	MapPin,
	RefreshCw,
	Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { ShiftCreationSheet } from "../ShiftCreationSheet";
import { AddEmployeeDialog } from "../AddEmployeeDialog";
import { AddLocationDialog } from "../AddLocationDialog";
import { OrganizationsAPI, Organization } from "../../api";
import { NotificationIcon } from "../notification-icon";

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
	const [organization, setOrganization] = useState<Organization | null>(null);

	// For notifications page specific controls
	const isNotificationsPage = location.pathname === "/notifications";

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
		if (path === "/notifications") return "Notifications";
		return "Scheduler";
	};

	// Check if we're on specific pages
	const isDailyShiftsPage = location.pathname.startsWith("/daily-shifts");
	const isEmployeesPage = location.pathname === "/employees";
	const isLocationsPage = location.pathname === "/locations";

	const renderActionButton = () => {
		if (isDailyShiftsPage) {
			return (
				<ShiftCreationSheet
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
			);
		} else if (isEmployeesPage && organization) {
			return (
				<AddEmployeeDialog
					organizationId={organization.id}
					onEmployeesAdded={() => {}}
					trigger={
						<Button
							variant="default"
							className="bg-black hover:bg-black/90 text-white">
							<Plus className="h-4 w-4 mr-2" />
							New Employee
						</Button>
					}
				/>
			);
		} else if (isLocationsPage && organization) {
			return (
				<AddLocationDialog
					organizationId={organization.id}
					onLocationsAdded={() => {}}
					trigger={
						<Button
							variant="default"
							className="bg-black hover:bg-black/90 text-white">
							<Plus className="h-4 w-4 mr-2" />
							New Location
						</Button>
					}
				/>
			);
		}
		return null;
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
					<div className="flex-1 flex items-center gap-3">
						<div className="text-lg font-semibold">{getPageTitle()}</div>
					</div>

					<div className="flex items-center gap-2">
						{!isNotificationsPage && <NotificationIcon />}
						{isNotificationsPage && (
							<Button
								variant="default"
								size="icon"
								className="bg-black hover:bg-black/90 text-white"
								asChild
								title="Notification settings">
								<Link to="/notification-settings">
									<Settings className="h-4 w-4" />
								</Link>
							</Button>
						)}
						{renderActionButton()}
					</div>
				</header>
				<main className="flex-1 overflow-auto mx-auto w-full">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
