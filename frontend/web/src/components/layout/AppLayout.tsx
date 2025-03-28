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
import { LocationFormDialog } from "../LocationFormDialog";
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
import { OnboardingModal } from "../onboarding/OnboardingModal";
import { EmployeeSheet } from "../EmployeeSheet";

// Layout content component that can access the sidebar context
function LayoutContent({
	hasSecondaryNavbar,
	renderSecondaryNavbar,
}: {
	hasSecondaryNavbar: boolean;
	renderSecondaryNavbar: (
		sidebarState: "expanded" | "collapsed"
	) => React.ReactNode;
}) {
	const { state } = useSidebar();

	return (
		<SidebarInset>
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

	const handleLogout = () => {
		signOut();
		navigate("/");
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

	return (
		<SidebarProvider>
			<Sidebar className="w-64">
				<AppSidebar />
			</Sidebar>
			<LayoutContent
				hasSecondaryNavbar={hasSecondaryNavbar}
				renderSecondaryNavbar={renderSecondaryNavbar}
			/>
			{/* Onboarding modal - shown globally for new users */}
			<OnboardingModal />
		</SidebarProvider>
	);
}
