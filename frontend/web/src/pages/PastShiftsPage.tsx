import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHeader } from "@/lib/header-context";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Filter, Users, Plus, ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { format, subMonths } from "date-fns";
import { ShiftsAPI } from "@/api";
import { SearchInput } from "@/components/ui/search-input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function PastShiftsPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { updateHeader } = useHeader();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [pastShifts, setPastShifts] = useState([]);

	// Search and filter states
	const [searchTerm, setSearchTerm] = useState("");
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: subMonths(new Date(), 1), // Default to past month
		to: new Date(),
	});
	const [locationFilter, setLocationFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	// Get parameters from URL
	const organizationId = searchParams.get("organizationId") || "";
	const locationId = searchParams.get("locationId");

	// Sample location data (replace with your actual location data)
	const locations = [
		{ id: "1", name: "Downtown Store" },
		{ id: "2", name: "Mall Location" },
		{ id: "3", name: "Bellwood" },
		{ id: "4", name: "Coffee Shop" },
	];

	// Setup header
	useEffect(() => {
		updateHeader({
			title: "Past Shifts",
			description: "View and search your historical shifts",
			actions: (
				<Button
					variant="outline"
					onClick={() =>
						navigate(`/manage-shifts?organizationId=${organizationId}`)
					}
					className="h-9">
					<ChevronLeft className="h-4 w-4 mr-2" />
					Back to Shifts
				</Button>
			),
		});
	}, [updateHeader, navigate, organizationId]);

	// Fetch past shifts
	useEffect(() => {
		const fetchPastShifts = async () => {
			try {
				setIsLoading(true);

				// In a real implementation, you would get shifts from your API with filters
				// Example API call (adjust according to your actual API)
				// const response = await ShiftsAPI.getShifts({
				//   organizationId,
				//   locationId: locationFilter,
				//   status: statusFilter,
				//   startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
				//   endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
				//   search: searchTerm
				// });

				// For now, set placeholder data
				setPastShifts([]);

				// Simulate loading time
				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			} catch (error) {
				console.error("Error fetching past shifts:", error);
				setIsLoading(false);
			}
		};

		fetchPastShifts();
	}, [organizationId, locationFilter, statusFilter, dateRange, searchTerm]);

	// Apply filters and trigger search
	const handleSearch = () => {
		// This would typically trigger the API call, but for now it's handled in the useEffect
		console.log("Searching with filters:", {
			searchTerm,
			dateRange,
			locationFilter,
			statusFilter,
		});
	};

	// Reset all filters
	const handleResetFilters = () => {
		setSearchTerm("");
		setDateRange({
			from: subMonths(new Date(), 1),
			to: new Date(),
		});
		setLocationFilter("");
		setStatusFilter("");
	};

	return (
		<ContentContainer>
			<ContentSection
				title="Past Shifts"
				description="Search and filter through your completed shifts"
				className="mb-8">
				{/* Search and Filter Controls */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
					<SearchInput
						value={searchTerm}
						onChange={setSearchTerm}
						placeholder="Search shifts by employee, location, or time..."
						className="w-full"
						onSearch={handleSearch}
					/>

					<DateRangePicker
						value={dateRange}
						onChange={setDateRange}
						placeholder="Select date range"
					/>

					<Select
						value={locationFilter}
						onValueChange={setLocationFilter}>
						<SelectTrigger>
							<SelectValue placeholder="Filter by location" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">All Locations</SelectItem>
							{locations.map((location) => (
								<SelectItem
									key={location.id}
									value={location.id}>
									{location.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={statusFilter}
						onValueChange={setStatusFilter}>
						<SelectTrigger>
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">All Statuses</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex justify-between items-center mb-4">
					<div className="text-sm text-muted-foreground">
						{isLoading ? "Loading..." : "0 shifts found"}
					</div>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleResetFilters}>
							Reset Filters
						</Button>
						<Button
							variant="default"
							size="sm"
							onClick={handleSearch}>
							Apply Filters
						</Button>
					</div>
				</div>

				{/* Past Shifts List */}
				{isLoading ? (
					<div className="grid place-items-center h-48">
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
				) : pastShifts.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{/* Past shifts would be mapped here */}
						<ShiftCardPlaceholder
							date="April 25, 2023"
							time="9:00 AM - 5:00 PM"
							location="Downtown Store"
							employees={3}
							status="Completed"
						/>
						<ShiftCardPlaceholder
							date="April 24, 2023"
							time="10:00 AM - 6:00 PM"
							location="Mall Location"
							employees={2}
							status="Cancelled"
						/>
						<ShiftCardPlaceholder
							date="April 20, 2023"
							time="8:00 AM - 4:00 PM"
							location="Bellwood"
							employees={4}
							status="Completed"
						/>
					</div>
				) : (
					<EmptyState
						title="No past shifts found"
						description="Try adjusting your filters or search terms"
						action={
							<Button
								variant="outline"
								onClick={handleResetFilters}>
								Reset Filters
							</Button>
						}
					/>
				)}
			</ContentSection>
		</ContentContainer>
	);
}

// Placeholder component for shift card
interface ShiftCardPlaceholderProps {
	date: string;
	time: string;
	location: string;
	employees: number;
	status?: "Completed" | "Cancelled";
}

function ShiftCardPlaceholder({
	date,
	time,
	location,
	employees,
	status = "Completed",
}: ShiftCardPlaceholderProps) {
	return (
		<Card className="hover:shadow-sm transition-shadow cursor-pointer">
			<CardContent className="p-4">
				<div className="flex justify-between items-start mb-3">
					<div>
						<div className="font-medium">{location}</div>
						<div className="text-sm text-muted-foreground">{date}</div>
					</div>
					<StatusBadge
						status={status === "Completed" ? "success" : "error"}
						text={status}
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center text-sm">
						<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
						<span>{time}</span>
					</div>

					<div className="flex items-center text-sm">
						<Users className="h-4 w-4 mr-2 text-muted-foreground" />
						<span>{employees} employees</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
