import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Location, LocationsAPI, OrganizationsAPI, Organization } from "@/api";
import {
	MapPin,
	Plus,
	ArrowUpDown,
	AlertCircle,
	LayoutGrid,
	List,
	Building2,
	ChevronRight,
	Search,
	X,
	ChevronDown,
	Eye,
	MoreHorizontal,
	Edit,
	Trash,
	User,
	PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Helmet } from "react-helmet";

// Import our dialog components
import { EditLocationDialog } from "@/components/EditLocationDialog";
import { DeleteLocationDialog } from "@/components/DeleteLocationDialog";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LocationCreationSheet } from "@/components/LocationCreationSheet";
import { PageHeader } from "@/components/ui/page-header";

import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";

// Import the DataCardGrid component
import { DataCardGrid } from "@/components/ui/data-card-grid";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { LocationFormDialog } from "@/components/LocationFormDialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/ui/search-input";
import { DataTableViewOptions } from "@/components/ui/data-table";

export default function LocationsPage() {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [locations, setLocations] = useState<Location[]>([]);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");
	const [viewFilter, setViewFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const organizationId = useOrganizationId();

	// Add pagination state for card view
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	const navigate = useNavigate();

	// Dialog states
	const [selectedLocation, setSelectedLocation] = useState<Location | null>(
		null
	);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleLocationsAdded = useCallback((newLocations: Location[]) => {
		setLocations((prev) => [...prev, ...newLocations]);
	}, []);

	const handleLocationUpdated = useCallback((updatedLocation: Location) => {
		setLocations((prev) =>
			prev.map((loc) => (loc.id === updatedLocation.id ? updatedLocation : loc))
		);
	}, []);

	const handleLocationDeleted = useCallback((locationId: string) => {
		setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
	}, []);

	// Fetch data
	const fetchData = async () => {
		try {
			setLoading(true);
			setLoadingPhase("organization");
			// In a real implementation, we would get the user's organization
			// For now, we'll use the first organization from the mock data
			const orgs = await OrganizationsAPI.getAll();
			if (orgs.length > 0) {
				setOrganization(orgs[0]);
				setLoadingPhase("locations");

				// Now get the locations for this organization
				const fetchedLocations = await LocationsAPI.getAll(organizationId);
				setLocations(fetchedLocations);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [organizationId]);

	const columns = useMemo<ColumnDef<Location>[]>(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="pl-0">
						Name
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
							<MapPin className="h-4 w-4 text-primary" />
						</div>
						<span className="font-medium">{row.original.name}</span>
					</div>
				),
				filterFn: (row, id, filterValue) => {
					return row.original.name
						.toLowerCase()
						.includes(filterValue.toLowerCase());
				},
			},
			{
				accessorKey: "address",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Address
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => <span>{row.original.address || "-"}</span>,
				filterFn: (row, id, filterValue) => {
					return (row.original.address || "")
						.toLowerCase()
						.includes(filterValue.toLowerCase());
				},
			},
			{
				accessorKey: "city",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						City
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => <span>{row.original.city || "-"}</span>,
				filterFn: (row, id, filterValue) => {
					return (row.original.city || "")
						.toLowerCase()
						.includes(filterValue.toLowerCase());
				},
			},
			{
				accessorKey: "state/zip",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						State/ZIP
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => (
					<span>
						{row.original.state} {row.original.zipCode}
					</span>
				),
				filterFn: (row, id, filterValue) => {
					const stateZip = `${row.original.state || ""} ${
						row.original.zipCode || ""
					}`;
					return stateZip.toLowerCase().includes(filterValue.toLowerCase());
				},
			},
			{
				id: "actions",
				cell: ({ row }) => {
					const location = row.original;
					return (
						<Button
							variant="ghost"
							size="sm"
							className="h-8"
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/locations/${location.id}`);
							}}>
							<Eye className="h-4 w-4" />
						</Button>
					);
				},
			},
		],
		[navigate]
	);

	// Get all the unique states from locations
	const uniqueStates = useMemo(() => {
		const states = Array.from(
			new Set(locations.map((location) => location.state).filter(Boolean))
		);
		return states.sort();
	}, [locations]);

	// Calculate pagination for card view
	const paginatedLocations = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return locations.slice(startIndex, endIndex);
	}, [locations, currentPage, pageSize]);

	// Pagination handlers for card view
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1); // Reset to first page when changing page size
	};

	const handleOpenEditDialog = (location: Location) => {
		setSelectedLocation(location);
		setEditDialogOpen(true);
	};

	const handleOpenDeleteDialog = (location: Location) => {
		setSelectedLocation(location);
		setDeleteDialogOpen(true);
	};

	// Get stats for cards
	const totalLocations = locations.length;
	const uniqueStateCoverage = uniqueStates.length;
	const locationsPerState =
		totalLocations > 0 && uniqueStateCoverage > 0
			? (totalLocations / uniqueStateCoverage).toFixed(1)
			: "0";

	// Update to handle location added
	const handleLocationAdded = (location: Location) => {
		fetchData();
	};

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					message={`Loading ${
						loadingPhase === "organization" ? "organization" : "locations"
					}...`}
					type="spinner"
					className="py-12"
				/>
			</ContentContainer>
		);
	}

	return (
		<>
			<Helmet>
				<title>Locations - Scheduler</title>
			</Helmet>

			<PageHeader
				title="Locations"
				description="Manage your business locations"
				actions={
					<div className="flex items-center gap-2">
						<LocationCreationSheet
							organizationId={organizationId}
							onLocationCreated={(newLocation) =>
								handleLocationsAdded([newLocation])
							}
							trigger={
								<Button>
									<PlusCircle className="h-4 w-4 mr-2" />
									Add Location
								</Button>
							}
						/>
					</div>
				}
			/>

			<ContentContainer>
				<ContentSection title="Locations">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<SearchInput
								value={searchQuery}
								onChange={setSearchQuery}
								placeholder="Search locations..."
							/>
						</div>
						<div className="flex items-center gap-2">
							<select
								value={viewFilter}
								onChange={(e) => setViewFilter(e.target.value)}
								className="p-2 rounded border">
								<option value="all">All</option>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
							</select>
							<LocationCreationSheet
								organizationId={organizationId}
								onLocationCreated={(newLocation) =>
									handleLocationsAdded([newLocation])
								}
								trigger={
									<Button className="md:hidden">
										<PlusCircle className="h-4 w-4 mr-2" />
										Add Location
									</Button>
								}
							/>
						</div>
					</div>

					{/* No locations */}
					{locations.length === 0 ? (
						<EmptyState
							title="No locations found"
							description="Start by adding locations to your organization"
							icon={<MapPin className="h-10 w-10" />}
							action={
								<LocationCreationSheet
									organizationId={organizationId}
									onLocationCreated={(newLocation) =>
										handleLocationsAdded([newLocation])
									}
									trigger={
										<Button className="bg-primary text-primary-foreground">
											<Plus className="mr-2 h-4 w-4" />
											Add Location
										</Button>
									}
								/>
							}
						/>
					) : (
						<DataTable
							columns={columns}
							data={locations}
							searchKey="name"
							searchPlaceholder="Search locations..."
							viewOptions={{
								enableViewToggle: true,
								defaultView: viewMode,
								onViewChange: setViewMode,
								renderCard: (location: Location) => (
									<Card
										className="cursor-pointer hover:shadow-sm transition-all border hover:border-primary"
										onClick={() =>
											navigate(`/locations/${location.id}`)
										}></Card>
								),
							}}
						/>
					)}
				</ContentSection>
			</ContentContainer>
		</>
	);
}
