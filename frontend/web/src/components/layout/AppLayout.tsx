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
import { AppSidebar } from "../AppSidebar";
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
import { NotificationSheet } from "../NotificationSheet";
import { useNotifications } from "../../lib/notification-context";
import { useLayout } from "../../lib/layout-context";
import { Switch } from "../ui/switch";
import { cn } from "../../lib/utils";

export default function AppLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const { pageHeader } = useLayout();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const organizationId = searchParams.get("organizationId") || "org-1";
	const [organization, setOrganization] = useState<Organization | null>(null);
	const { useSampleData, toggleSampleData } = useNotifications();

	// For notifications page specific controls
	const isNotificationsPage = location.pathname === "/notifications";
	const isMessagesPage = location.pathname === "/messages";
	const shouldShowSampleData = isNotificationsPage || isMessagesPage;

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

	// Check if we're on specific pages
	const isDailyShiftsPage = location.pathname.startsWith("/daily-shifts");
	const isEmployeesPage = location.pathname === "/employees";
	const isLocationsPage = location.pathname === "/locations";
	const isAdminDashboardPage = location.pathname === "/admin-dashboard";

	const renderActionButton = () => {
		// If we have actions from the page header, use those first
		if (pageHeader.actions) {
			return pageHeader.actions;
		}

		// Otherwise, fall back to the default actions based on route
		// We've removed the specific buttons as they're now in the content area
		return null;
	};

	// Combine all actions for the app header
	const renderHeaderActions = () => {
		// Avoid creating new React elements for actions on every render
		// Instead, check if we already have actions from the page header
		const actionButton = renderActionButton();

		return (
			<div className="flex items-center gap-2">
				{actionButton}
				{shouldShowSampleData && (
					<div className="flex items-center gap-3 bg-muted/50 p-1.5 pl-3 rounded-full">
						<span className="text-sm font-medium">Sample Data</span>
						<Switch
							checked={useSampleData}
							onCheckedChange={toggleSampleData}
						/>
					</div>
				)}
				{!isNotificationsPage && !isMessagesPage && <NotificationSheet />}
			</div>
		);
	};

	// Get the header title, first from context, then fall back to route-based
	const getHeaderTitle = () => {
		if (pageHeader.title) {
			return pageHeader.title;
		}

		const path = location.pathname;
		if (path === "/dashboard" || path === "/admin-dashboard")
			return "Dashboard";
		if (
			path === "/schedule" ||
			path.startsWith("/daily-shifts") ||
			path === "/schedule/monthly"
		)
			return "Schedule";
		if (path === "/employees" || path.startsWith("/employee-detail"))
			return "Employees";
		if (path === "/locations" || path.startsWith("/location-detail"))
			return "Locations";
		if (path === "/messages") return "Messages";
		if (path === "/notifications") return "Notifications";
		if (path === "/billing") return "Billing";
		if (path === "/profile" || path === "/business-profile") return "Settings";
		return "Scheduler";
	};

	return (
		<SidebarProvider>
			<Sidebar className="w-64">
				<AppSidebar />
			</Sidebar>
			<SidebarInset>
				<header className="sticky top-0 flex h-14 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 z-40">
					<div className="flex flex-1 items-center">
						<div className="flex items-center gap-2">
							<SidebarTrigger className="-ml-1" />
						</div>
						<div className="mx-4">
							<h1 className="text-lg font-semibold">{getHeaderTitle()}</h1>
							{pageHeader.description && (
								<p className="text-sm text-muted-foreground">
									{pageHeader.description}
								</p>
							)}
						</div>
					</div>
					<div className="flex items-center justify-end">
						{renderHeaderActions()}
					</div>
				</header>
				<main className="flex-1 overflow-auto w-full">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
