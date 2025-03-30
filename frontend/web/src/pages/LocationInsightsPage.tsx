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
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { LocationInsights } from "@/components/LocationInsights";
import { LocationEmployeeInsights } from "@/components/LocationEmployeeInsights";
import { LocationFinanceInsights } from "@/components/LocationFinanceInsights";
import { LocationShiftInsights } from "@/components/LocationShiftInsights";
import { Button } from "@/components/ui/button";
import {
	Building2,
	Users,
	Calendar,
	Clock,
	DollarSign,
	BarChart,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useHeader } from "@/lib/header-context";
import { LocationNav } from "@/components/LocationNav";

export default function LocationInsightsPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const [location, setLocation] = useState<Location | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");

	// Update the header when location data is loaded
	useEffect(() => {
		if (loading) {
			updateHeader({
				title: "Loading Location Insights...",
				description: "Retrieving location data and analytics",
				showBackButton: true,
			});
		} else if (!location) {
			updateHeader({
				title: "Location not found",
				description: "The requested location could not be found",
				showBackButton: true,
			});
		} else {
			updateHeader({
				title: `${location.name} - Insights & Analytics`,
				description:
					"Detailed analytics and performance metrics for this location",
				showBackButton: true,
			});
		}
	}, [loading, location, updateHeader]);

	useEffect(() => {
		const fetchData = async () => {
			if (!locationId) return;

			try {
				setLoading(true);
				setLoadingPhase("location");

				// Fetch location data
				const locationData = await LocationsAPI.getById(locationId);
				if (!locationData) {
					throw new Error("Location not found");
				}
				setLocation(locationData);

				// Fetch shifts for this location
				setLoadingPhase("shifts");
				const allShifts = await ShiftsAPI.getAllSchedules();
				const locationShifts = allShifts.filter(
					(shift: Shift) => shift.location_id === locationId
				);
				setShifts(locationShifts);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				const organizationId = "org-1"; // Default organization ID
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
				toast.error("Failed to load location data");
				navigate("/locations");
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
				{/* General Location Insights */}
				<ContentSection
					title="Overview Metrics"
					description="Key performance metrics for this location">
					<div className="mb-4">
						<p className="text-muted-foreground">
							These high-level metrics provide a snapshot of your location's
							overall performance. They help you quickly assess productivity,
							employee utilization, and financial health at a glance. Monitor
							these trends over time to identify opportunities for improvement.
						</p>
					</div>
					<LocationInsights
						location={location}
						shifts={shifts}
						employees={assignedEmployees}
					/>
				</ContentSection>

				{/* Employee Insights */}
				<ContentSection
					title="Employee Analytics"
					description="Employee performance and scheduling insights">
					<div className="mb-4">
						<p className="text-muted-foreground">
							Understanding your workforce is crucial for optimizing scheduling
							and productivity. These metrics analyze employee reliability,
							performance patterns, and workforce distribution. Use these
							insights to identify top performers, address attendance issues,
							and improve staff allocation.
						</p>
					</div>
					<LocationEmployeeInsights
						location={location}
						shifts={shifts}
						employees={assignedEmployees}
					/>
				</ContentSection>

				{/* Shift Analytics */}
				<ContentSection
					title="Shift Analytics"
					description="Shift patterns and scheduling efficiency">
					<div className="mb-4">
						<p className="text-muted-foreground">
							Shift metrics reveal patterns in your scheduling and help identify
							opportunities to improve coverage. By understanding completion
							rates, no-shows, and peak times, you can optimize staff
							allocation, reduce gaps in coverage, and ensure proper staffing
							during your busiest periods.
						</p>
					</div>
					<LocationShiftInsights
						location={location}
						shifts={shifts}
						employees={assignedEmployees}
					/>
				</ContentSection>

				{/* Financial Insights */}
				<ContentSection
					title="Financial Insights"
					description="Revenue, costs, and profitability metrics">
					<div className="mb-4">
						<p className="text-muted-foreground">
							Financial insights help you understand the economic health of your
							location. These metrics track revenue generation, labor costs,
							profitability, and projected earnings. Use this data to make
							informed decisions about scheduling, staffing levels, and cost
							control to maximize profitability while maintaining service
							quality.
						</p>
					</div>
					<LocationFinanceInsights
						location={location}
						shifts={shifts}
						employees={assignedEmployees}
					/>
				</ContentSection>
			</div>
		</ContentContainer>
	);
}
