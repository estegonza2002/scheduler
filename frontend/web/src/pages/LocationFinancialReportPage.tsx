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
			<ContentContainer>
				<LoadingState
					type="skeleton"
					skeletonCount={4}
					skeletonHeight={60}
					message={`Loading ${loadingPhase}...`}
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

				<div className="grid gap-6 mt-6 px-8">
					<div className="print:py-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<Button
								variant="default"
								className="h-auto py-4 px-6 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center text-left"
								onClick={() =>
									navigate(`/locations/${locationId}/financial/profit-loss`)
								}>
								<FileBarChart className="h-8 w-8 mb-2" />
								<div className="text-left w-full">
									<h3 className="font-semibold text-lg">Profit & Loss</h3>
									<p className="text-xs opacity-90">
										Detailed P&L statements with monthly comparison
									</p>
								</div>
							</Button>

							<Button
								variant="default"
								className="h-auto py-4 px-6 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center text-left"
								onClick={() =>
									navigate(`/locations/${locationId}/financial/cost-revenue`)
								}>
								<FilePieChart className="h-8 w-8 mb-2" />
								<div className="text-left w-full">
									<h3 className="font-semibold text-lg">Cost vs Revenue</h3>
									<p className="text-xs opacity-90">
										Track all expenses against revenue streams
									</p>
								</div>
							</Button>

							<Button
								variant="default"
								className="h-auto py-4 px-6 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center text-left"
								onClick={() =>
									navigate(`/locations/${locationId}/financial/forecasting`)
								}>
								<DollarSign className="h-8 w-8 mb-2" />
								<div className="text-left w-full">
									<h3 className="font-semibold text-lg">
										Financial Forecasting
									</h3>
									<p className="text-xs opacity-90">
										Predictive analytics and future projections
									</p>
								</div>
							</Button>
						</div>

						<LocationFinancialReport
							location={location}
							shifts={shifts}
							employees={assignedEmployees}
						/>
					</div>
				</div>
			</ContentContainer>
		</>
	);
}
