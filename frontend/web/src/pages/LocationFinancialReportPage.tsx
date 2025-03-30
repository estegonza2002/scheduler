import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Location,
	LocationsAPI,
	ShiftsAPI,
	Shift,
	EmployeesAPI,
	Employee,
	EmployeeLocationsAPI,
} from "@/api";
import { Button } from "@/components/ui/button";
import {
	ChevronLeft,
	DollarSign,
	Printer,
	Download,
	FileBarChart,
	CalendarRange,
	FilePieChart,
	Calculator,
	Building2,
	Users,
	Calendar,
	BarChart,
} from "lucide-react";
import { toast } from "sonner";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LocationFinancialReport } from "@/components/LocationFinancialReport";
import { LoadingState } from "@/components/ui/loading-state";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useHeader } from "@/lib/header-context";
import { LocationNav } from "@/components/LocationNav";

export default function LocationFinancialReportPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const [location, setLocation] = useState<Location | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");

	// Handle print
	const handlePrint = () => {
		window.print();
	};

	// Handle export (dummy function - would normally generate PDF or CSV)
	const handleExport = () => {
		toast.success("Financial report exported successfully");
	};

	// Update the header content based on loading and location state
	useEffect(() => {
		if (loading) {
			updateHeader({
				title: "Loading...",
				description: "Retrieving financial report data",
				showBackButton: true,
			});
		} else if (!location) {
			updateHeader({
				title: "Location not found",
				description: "The requested location could not be found",
				showBackButton: true,
			});
		} else {
			// Actions for the header
			const headerActions = (
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							navigate(`/locations/${locationId}/financial/monthly`)
						}>
						<CalendarRange className="h-4 w-4 mr-2" /> Monthly Reports
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							navigate(`/locations/${locationId}/financial/expenses`)
						}>
						<Calculator className="h-4 w-4 mr-2" /> Expense Analysis
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handlePrint}>
						<Printer className="h-4 w-4 mr-2" /> Print Report
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleExport}>
						<Download className="h-4 w-4 mr-2" /> Export as CSV
					</Button>
				</div>
			);

			updateHeader({
				title: `${location.name} - Financial Report`,
				description: "Comprehensive financial analysis and reporting tools",
				actions: headerActions,
				showBackButton: true,
			});
		}
	}, [
		loading,
		location,
		locationId,
		navigate,
		handlePrint,
		handleExport,
		updateHeader,
	]);

	useEffect(() => {
		const fetchData = async () => {
			if (!locationId) return;

			try {
				setLoading(true);
				setLoadingPhase("location");

				// Fetch location data
				const locationData = await LocationsAPI.getById(locationId);
				if (!locationData) {
					toast.error("Location not found");
					navigate("/locations");
					return;
				}
				setLocation(locationData);

				// Fetch shifts for this location
				setLoadingPhase("shifts");
				const organizationId = "org-1"; // Default organization ID
				const allSchedules = await ShiftsAPI.getAllSchedules(organizationId);
				const allShifts: Shift[] = [];

				// Get all shifts from all schedules
				for (const schedule of allSchedules) {
					const scheduleShifts = await ShiftsAPI.getShiftsForSchedule(
						schedule.id
					);
					allShifts.push(...scheduleShifts);
				}

				// Filter for shifts at this location
				const locationShifts = allShifts.filter(
					(shift) => shift.location_id === locationId
				);
				setShifts(locationShifts);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				const employees = await EmployeesAPI.getAll(organizationId);

				// Get employee IDs assigned to this location using the proper API
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId
				);

				// Filter employees to those assigned to this location
				const assignedEmployeesList = employees.filter((employee) =>
					assignedEmployeeIds.includes(employee.id)
				);

				setAssignedEmployees(assignedEmployeesList);
			} catch (error) {
				console.error("Error fetching data:", error);
				toast.error("Failed to load financial report data");
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchData();
	}, [locationId, navigate]);

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					type="spinner"
					message={`Loading ${loadingPhase}...`}
					className="py-12"
				/>
			</ContentContainer>
		);
	}

	if (!location) {
		return (
			<ContentContainer>
				<ContentSection
					title="Location not found"
					description="The requested location could not be found."
					footer={
						<Button
							variant="outline"
							onClick={() => navigate("/locations")}
							className="mt-2">
							Back to Locations
						</Button>
					}>
					<p>
						The location you're looking for may have been removed or doesn't
						exist.
					</p>
				</ContentSection>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			<LocationNav />
			<div className="grid gap-8 mt-6">
				{/* Financial Reports */}
				<ContentSection
					title="Financial Reports"
					description="Select a financial report to view detailed information"
					className="print:hidden">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card>
							<CardHeader>
								<CardTitle>Profit & Loss</CardTitle>
								<CardDescription>
									Detailed P&L statements with monthly comparison
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="default"
									className="w-full"
									onClick={() =>
										navigate(`/locations/${locationId}/financial/profit-loss`)
									}>
									<FileBarChart className="h-5 w-5 mr-2" />
									View Report
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Cost vs Revenue</CardTitle>
								<CardDescription>
									Track all expenses against revenue streams
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="default"
									className="w-full"
									onClick={() =>
										navigate(`/locations/${locationId}/financial/cost-revenue`)
									}>
									<FilePieChart className="h-5 w-5 mr-2" />
									View Report
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Financial Forecasting</CardTitle>
								<CardDescription>
									Predictive analytics and future projections
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="default"
									className="w-full"
									onClick={() =>
										navigate(`/locations/${locationId}/financial/forecasting`)
									}>
									<DollarSign className="h-5 w-5 mr-2" />
									View Report
								</Button>
							</CardContent>
						</Card>
					</div>
				</ContentSection>

				{/* Financial Summary */}
				<ContentSection
					title="Financial Summary"
					description="Current financial metrics and performance data"
					className="print:py-4">
					<LocationFinancialReport
						location={location}
						shifts={shifts}
						employees={assignedEmployees}
					/>
				</ContentSection>
			</div>
		</ContentContainer>
	);
}
