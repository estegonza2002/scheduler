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
	useSidebar,
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
	LogOut,
	Shield,
	ClipboardList,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { ShiftCreationSheet } from "../ShiftCreationSheet";
import { AddEmployeeDialog } from "../AddEmployeeDialog";
import { AddLocationDialog } from "../AddLocationDialog";
import { OrganizationsAPI, Organization } from "../../api";
import { useNotifications } from "../../lib/notification-context";
import { useLayout } from "../../lib/layout-context";
import { Switch } from "../ui/switch";
import { cn } from "../../lib/utils";
import {
	ScheduleSidebar,
	LocationsSidebar,
	EmployeesSidebar,
	SecondaryNavbar,
} from "./SecondaryNavbar";
import { useAuth } from "../../lib/auth";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { getHeaderActions } from "../../pages/DailyShiftsPage";

// Layout content component that can access the sidebar context
function LayoutContent({
	hasSecondaryNavbar,
	renderSecondaryNavbar,
	renderHeaderActions,
	getHeaderTitle,
	pageHeader,
}: {
	hasSecondaryNavbar: boolean;
	renderSecondaryNavbar: (
		sidebarState: "expanded" | "collapsed"
	) => React.ReactNode;
	renderHeaderActions: () => React.ReactNode;
	getHeaderTitle: () => string;
	pageHeader: any;
}) {
	const { state } = useSidebar();
	const navigate = useNavigate();
	const location = useLocation();

	// Determine if current page should show back button (not on main/top-level pages)
	const isTopLevelPage = [
		"/dashboard",
		"/admin-dashboard",
		"/daily-shifts",
		"/schedule",
		"/employees",
		"/locations",
		"/shifts",
		"/profile",
		"/business-profile",
		"/billing",
		"/branding",
		"/notifications",
		"/messages",
	].includes(location.pathname);

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<SidebarInset>
			<header className="sticky top-0 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 z-40">
				<div className="flex flex-1 items-center">
					<div className="flex items-center gap-2">
						<SidebarTrigger className="-ml-1" />
						{!isTopLevelPage && (
							<Button
								variant="ghost"
								size="icon"
								onClick={handleGoBack}
								className="h-8 w-8"
								title="Go back">
								<ChevronLeft className="h-5 w-5" />
							</Button>
						)}
					</div>
					<div className="mx-4">
						<h1 className="text-lg font-semibold">
							{pageHeader.title || getHeaderTitle()}
						</h1>
						{pageHeader.description && (
							<p className="text-xs text-muted-foreground">
								{pageHeader.description}
							</p>
						)}
					</div>
				</div>
				<div className="flex items-center justify-end gap-3">
					{renderHeaderActions()}
				</div>
			</header>
			{hasSecondaryNavbar && renderSecondaryNavbar(state)}
			<main
				className="flex-1 overflow-auto w-full transition-all duration-200"
				style={
					hasSecondaryNavbar
						? {
								marginLeft:
									state === "collapsed"
										? "calc(var(--sidebar-width-icon) + 16rem)"
										: "calc(var(--sidebar-width) + 16rem)",
						  }
						: {}
				}>
				<Outlet />
			</main>
		</SidebarInset>
	);
}

export default function AppLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const { pageHeader } = useLayout();
	const { signOut } = useAuth();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const organizationId = searchParams.get("organizationId") || "org-1";
	const [organization, setOrganization] = useState<Organization | null>(null);
	const { useSampleData, toggleSampleData } = useNotifications();
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	// Pages with different layouts and actions
	const isCheckoutPage = location.pathname === "/checkout";
	const isLoginPage = location.pathname === "/login";
	const isMessagesPage = location.pathname === "/chat";
	const isSchedulePage = location.pathname === "/schedule";
	const isSchedulerPage = location.pathname.startsWith("/scheduler");
	const isShiftDetailsPage = location.pathname.match(/\/shifts\/(\w+)/);
	const isDailyShiftsPage = location.pathname === "/daily-shifts";
	const isEmployeesPage = location.pathname === "/employees";
	const isLocationsPage = location.pathname === "/locations";

	// Determines if the page should have a secondary sidebar
	const hasSecondarySidebar = isMessagesPage || isShiftDetailsPage;

	// Hide certain elements on auth pages

	// Check if we're on specific pages
	const isAdminDashboardPage = location.pathname === "/admin-dashboard";
	const isProfilePage = location.pathname === "/profile";
	const isBillingPage = location.pathname === "/billing";
	const isBrandingPage = location.pathname === "/branding";

	// Check if we need secondary navbar
	const hasSecondaryNavbar = isSchedulePage;

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

	const renderActionButton = () => {
		// If we have actions from the page header, use those first
		if (pageHeader.actions) {
			return pageHeader.actions;
		}

		// Otherwise, fall back to the default actions based on route
		// We've removed the specific buttons as they're now in the content area
		return null;
	};

	const handleLogout = () => {
		signOut();
		navigate("/");
	};

	// Combine all actions for the app header
	const renderHeaderActions = () => {
		// Avoid creating new React elements for actions on every render
		// Instead, check if we already have actions from the page header
		const actionButton = renderActionButton();

		// Check if we're on the Shifts page
		const isShiftsPage = location.pathname === "/shifts";

		return (
			<div className="flex items-center gap-2">
				{actionButton}
				{isMessagesPage && (
					<Button
						onClick={() =>
							window.dispatchEvent(new CustomEvent("new-conversation-click"))
						}
						className="mr-2">
						<Plus className="h-4 w-4 mr-2" />
						New Conversation
					</Button>
				)}
				{isShiftsPage && (
					<ShiftCreationSheet
						scheduleId="schedule-456"
						organizationId="org-123"
						trigger={
							<Button
								className="gap-2 font-medium"
								size="default">
								<Plus className="h-4 w-4" />
								Create Shift
							</Button>
						}
						onShiftCreated={() => {
							// Handle refresh after shift creation
							// In a real app, you would refetch shifts data
						}}
					/>
				)}
				{hasSecondarySidebar ? (
					<AlertDialog
						open={showLogoutDialog}
						onOpenChange={setShowLogoutDialog}>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								title="Log out">
								<LogOut className="h-5 w-5" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Are you sure you want to log out?
								</AlertDialogTitle>
								<AlertDialogDescription>
									You will need to sign in again to access your account.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleLogout}>
									Log out
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				) : isDailyShiftsPage ? (
					getHeaderActions()
				) : null}
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
			path === "/daily-shifts" ||
			path.startsWith("/daily-shifts")
		)
			return "Schedule";
		if (path === "/shifts" || path.startsWith("/shifts/")) return "Shifts";
		if (path === "/employees") return "Employees";
		if (
			path.startsWith("/employee-detail/") ||
			path.startsWith("/employee-earnings/")
		)
			return "Employee Details";
		if (path === "/locations") return "Locations";
		if (path.startsWith("/locations/")) {
			if (path.includes("/finance")) {
				return "Location Financial Report";
			}
			return "Location Details";
		}
		if (path === "/messages") return "Messages";
		if (path === "/profile") return "Profile";
		if (path === "/business-profile") return "Business Profile";
		if (path === "/billing") return "Billing & Subscription";
		if (path === "/branding") return "Branding";
		if (path === "/notifications") return "Notifications";
		return "Scheduler";
	};

	// Render the appropriate secondary navbar based on the current route
	const renderSecondaryNavbar = (sidebarState: "expanded" | "collapsed") => {
		if (isSchedulePage) {
			const viewMode =
				(searchParams.get("view") as "calendar" | "daily") || "calendar";

			return (
				<ScheduleSidebar
					viewMode={viewMode}
					onViewModeChange={(mode) => {
						const newParams = new URLSearchParams(searchParams);
						newParams.set("view", mode);
						setSearchParams(newParams);
					}}
					onViewToday={() => {
						const today = new Date();
						navigate(`/schedule?date=${format(today, "yyyy-MM-dd")}`);
					}}
					sidebarState={sidebarState}
				/>
			);
		}

		// Location sidebar removed - now returns null
		return null;
	};

	// Determine the active sidebar item based on the path
	const isPathActive = (basePath: string) => {
		const pathname = window.location.pathname;
		if (basePath === "/dashboard" && pathname === "/dashboard") return true;
		if (basePath === "/admin-dashboard" && pathname === "/admin-dashboard")
			return true;
		if (
			(basePath === "/schedule" || basePath === "/daily-shifts") &&
			(pathname.startsWith("/daily-shifts") ||
				pathname.startsWith("/schedule") ||
				pathname === "/today")
		)
			return true;
		if (basePath === "/shifts" && pathname.startsWith("/shifts")) return true;
		if (
			basePath === "/employees" &&
			(pathname === "/employees" ||
				pathname.startsWith("/employee-detail") ||
				pathname.startsWith("/employee-earnings"))
		)
			return true;
		if (
			basePath === "/locations" &&
			(pathname === "/locations" || pathname.startsWith("/locations/"))
		)
			return true;
		if (basePath === "/notifications" && pathname === "/notifications")
			return true;
		if (basePath === "/messages" && pathname === "/messages") return true;
		if (
			basePath === "/settings" &&
			(pathname === "/profile" ||
				pathname === "/business-profile" ||
				pathname === "/billing" ||
				pathname === "/branding")
		)
			return true;
		return false;
	};

	return (
		<SidebarProvider>
			<Sidebar className="w-64">
				<AppSidebar />
			</Sidebar>
			<LayoutContent
				hasSecondaryNavbar={hasSecondaryNavbar}
				renderSecondaryNavbar={renderSecondaryNavbar}
				renderHeaderActions={renderHeaderActions}
				getHeaderTitle={getHeaderTitle}
				pageHeader={pageHeader}
			/>
		</SidebarProvider>
	);
}
