import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Location,
	LocationsAPI,
	ShiftsAPI,
	Shift,
	EmployeesAPI,
	Employee,
} from "../api";
import { Button } from "../components/ui/button";
import {
	ChevronLeft,
	DollarSign,
	Printer,
	Download,
	FileBarChart,
	CalendarRange,
	FilePieChart,
	Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LocationFinancialReport } from "../components/LocationFinancialReport";
import { LocationSubNav } from "../components/LocationSubNav";
import { LoadingState } from "../components/ui/loading-state";
import { PageHeader } from "../components/ui/page-header";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export default function LocationFinancialReportPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const [location, setLocation] = useState<Location | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");

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
				const allShifts = await ShiftsAPI.getAll();
				const locationShifts = allShifts.filter(
					(shift) => shift.location_id === locationId
				);
				setShifts(locationShifts);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				const organizationId = "org-1"; // Default organization ID
				const employees = await EmployeesAPI.getAll(organizationId);

				// Filter by location assignment (for demo purposes)
				const assignedEmployees = employees.filter((employee) => {
					// @ts-ignore - locationAssignment is a custom property we're assuming exists
					return employee.locationAssignment === locationId;
				});

				setAssignedEmployees(assignedEmployees);
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

	// Handle print
	const handlePrint = () => {
		window.print();
	};

	// Handle export (dummy function - would normally generate PDF or CSV)
	const handleExport = () => {
		toast.success("Financial report exported successfully");
	};

	if (loading) {
		return (
			<>
				<PageHeader
					title="Loading..."
					description="Retrieving financial report data"
					showBackButton={true}
				/>

				<ContentContainer>
					<LoadingState
						type="spinner"
						message={`Loading ${loadingPhase}...`}
						className="py-12"
					/>
				</ContentContainer>
			</>
		);
	}

	if (!location) {
		return (
			<>
				<PageHeader
					title="Location not found"
					description="The requested location could not be found"
					showBackButton={true}
				/>

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
			</>
		);
	}

	// Actions for the header
	const headerActions = (
		<div className="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={() => navigate(`/locations/${locationId}/financial/monthly`)}>
				<CalendarRange className="h-4 w-4 mr-2" /> Monthly Reports
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={() => navigate(`/locations/${locationId}/financial/expenses`)}>
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

	return (
		<>
			<PageHeader
				title={`${location.name} - Financial Report`}
				description="Comprehensive financial analysis and reporting tools"
				actions={headerActions}
				showBackButton={true}
			/>

			<ContentContainer>
				<LocationSubNav
					locationId={locationId || ""}
					locationName={location.name}
				/>

				<ContentSection
					title="Financial Reports"
					description="Select a financial report to view detailed information"
					className="mt-6 print:hidden">
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

				<ContentSection
					title="Financial Summary"
					description="Current financial metrics and performance data"
					className="mt-6 print:py-4">
					<LocationFinancialReport
						location={location}
						shifts={shifts}
						employees={assignedEmployees}
					/>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
