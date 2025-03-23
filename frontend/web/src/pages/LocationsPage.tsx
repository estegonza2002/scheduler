import { useState, useEffect, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Location, LocationsAPI, OrganizationsAPI, Organization } from "../api";
import {
	MapPin,
	MoreVertical,
	Plus,
	Search,
	ArrowUpDown,
	Loader2,
	Filter,
	X,
	AlertCircle,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";

// Import our dialog components
import { AddLocationDialog } from "../components/AddLocationDialog";
import { EditLocationDialog } from "../components/EditLocationDialog";
import { DeleteLocationDialog } from "../components/DeleteLocationDialog";
import { DataTable } from "../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function LocationsPage() {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [locations, setLocations] = useState<Location[]>([]);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [stateFilter, setStateFilter] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const navigate = useNavigate();

	// Dialog states
	const [selectedLocation, setSelectedLocation] = useState<Location | null>(
		null
	);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
				cell: ({ row }) => <>{row.original.address || "-"}</>,
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
				cell: ({ row }) => <>{row.original.city || "-"}</>,
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
					<>
						{row.original.state} {row.original.zipCode}
					</>
				),
			},
			{
				accessorKey: "status",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Status
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => (
					<Badge
						variant="outline"
						className={`${
							row.original.isActive
								? "bg-green-100 text-green-800 hover:bg-green-100"
								: "bg-red-100 text-red-800 hover:bg-red-100"
						}`}>
						{row.original.isActive ? "Active" : "Inactive"}
					</Badge>
				),
			},
			{
				id: "actions",
				cell: ({ row }) => {
					const location = row.original;
					return (
						<div onClick={(e) => e.stopPropagation()}>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-8 p-0">
										<span className="sr-only">Open menu</span>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem
										onClick={() => navigate(`/location-detail/${location.id}`)}>
										View Details
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleOpenEditDialog(location)}>
										Edit Location
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive"
										onClick={() => handleOpenDeleteDialog(location)}>
										Delete Location
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[navigate]
	);

	useEffect(() => {
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
					const fetchedLocations = await LocationsAPI.getAll(orgs[0].id);
					setLocations(fetchedLocations);
				}
			} catch (error) {
				console.error("Error fetching locations:", error);
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchData();
	}, []);

	// Get unique states for filter
	const uniqueStates = useMemo(() => {
		return [
			...new Set(locations.map((location) => location.state).filter(Boolean)),
		].filter((state) => state !== null && state !== undefined) as string[];
	}, [locations]);

	// Filter locations by state, status, and search term
	const filteredLocations = useMemo(() => {
		return locations.filter((location) => {
			// Apply state filter
			if (stateFilter && location.state !== stateFilter) {
				return false;
			}

			// Apply status filter
			if (statusFilter === "active" && !location.isActive) {
				return false;
			}
			if (statusFilter === "inactive" && location.isActive) {
				return false;
			}

			// Apply search filter
			if (searchTerm) {
				const lowercaseSearch = searchTerm.toLowerCase();
				const name = (location.name || "").toLowerCase();
				const address = (location.address || "").toLowerCase();
				const city = (location.city || "").toLowerCase();
				const state = (location.state || "").toLowerCase();

				return (
					name.includes(lowercaseSearch) ||
					address.includes(lowercaseSearch) ||
					city.includes(lowercaseSearch) ||
					state.includes(lowercaseSearch)
				);
			}

			return true;
		});
	}, [locations, stateFilter, statusFilter, searchTerm]);

	const handleLocationsAdded = (newLocations: Location[]) => {
		setLocations((prev) => [...prev, ...newLocations]);
	};

	const handleLocationUpdated = (updatedLocation: Location) => {
		setLocations((prev) =>
			prev.map((loc) => (loc.id === updatedLocation.id ? updatedLocation : loc))
		);
	};

	const handleLocationDeleted = (locationId: string) => {
		setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
	};

	// Dialog open handlers
	const handleOpenEditDialog = (location: Location) => {
		setSelectedLocation(location);
		setEditDialogOpen(true);
	};

	const handleOpenDeleteDialog = (location: Location) => {
		setSelectedLocation(location);
		setDeleteDialogOpen(true);
	};

	// Clear all filters
	const handleClearFilters = () => {
		setStateFilter(null);
		setStatusFilter(null);
		setSearchTerm("");
	};

	// Render loading skeleton
	const renderLoadingSkeleton = () => {
		return (
			<div className="space-y-6">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-8 w-48" />
				</div>

				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-16 w-full rounded-md" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-24 w-full rounded-md"
							/>
						))}
					</div>
				</div>
			</div>
		);
	};

	if (loading) {
		return <div className="p-6">{renderLoadingSkeleton()}</div>;
	}

	return (
		<div className="p-4">
			{locations.length === 0 ? (
				<div className="text-center py-12 border-2 border-dashed rounded-lg">
					<MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium mb-2">No locations found</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Start by adding locations to your organization
					</p>
					{organization && (
						<AddLocationDialog
							organizationId={organization.id}
							onLocationsAdded={handleLocationsAdded}
							trigger={
								<Button
									variant="default"
									className="bg-black hover:bg-black/90 text-white">
									<Plus className="mr-2 h-4 w-4" />
									Add First Location
								</Button>
							}
						/>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{/* Search bar */}
					<div className="relative mb-4">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search locations by name, address, city or state..."
							className="pl-10"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* Filter controls in a simplified row */}
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
						<div className="flex items-center">
							<Filter className="h-4 w-4 mr-2 text-muted-foreground" />
							<span className="text-sm font-medium">Filters</span>
						</div>

						<div className="flex items-center">
							<span className="text-sm mr-2">State</span>
							<Select
								value={stateFilter || "all"}
								onValueChange={(value) =>
									setStateFilter(value === "all" ? null : value)
								}>
								<SelectTrigger className="w-[160px] h-8">
									<SelectValue placeholder="All states" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All states</SelectItem>
									{uniqueStates.map((state) => (
										<SelectItem
											key={state}
											value={state}>
											{state}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center">
							<span className="text-sm mr-2">Status</span>
							<Select
								value={statusFilter || "all"}
								onValueChange={(value) =>
									setStatusFilter(value === "all" ? null : value)
								}>
								<SelectTrigger className="w-[160px] h-8">
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Clear filters button */}
						{(stateFilter || statusFilter || searchTerm) && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearFilters}
								className="h-8 ml-auto">
								<X className="h-4 w-4 mr-1" />
								Clear
							</Button>
						)}
					</div>

					{/* Active filters badges */}
					{(stateFilter || statusFilter) && (
						<div className="flex flex-wrap gap-2 mb-4">
							{stateFilter && (
								<Badge
									variant="outline"
									className="flex items-center gap-1 bg-muted/40 py-1 px-2">
									State: {stateFilter}
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 ml-1 p-0"
										onClick={() => setStateFilter(null)}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
							{statusFilter && (
								<Badge
									variant="outline"
									className="flex items-center gap-1 bg-muted/40 py-1 px-2">
									Status: {statusFilter === "active" ? "Active" : "Inactive"}
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 ml-1 p-0"
										onClick={() => setStatusFilter(null)}>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							)}
						</div>
					)}

					{/* Employee Table */}
					{filteredLocations.length === 0 ? (
						<div className="bg-muted/30 rounded-lg p-6 text-center">
							<AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
							<h3 className="text-base font-medium mb-1">No locations found</h3>
							<p className="text-sm text-muted-foreground">
								{stateFilter || statusFilter || searchTerm
									? "Try adjusting your filters or search term"
									: "There are no locations in your organization"}
							</p>
						</div>
					) : (
						<>
							<DataTable
								columns={columns}
								data={filteredLocations}
							/>
						</>
					)}
				</div>
			)}

			{/* Dialogs with controlled state */}
			{selectedLocation && (
				<>
					<EditLocationDialog
						location={selectedLocation}
						onLocationUpdated={handleLocationUpdated}
						open={editDialogOpen}
						onOpenChange={setEditDialogOpen}
					/>

					<DeleteLocationDialog
						location={selectedLocation}
						onLocationDeleted={handleLocationDeleted}
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
					/>
				</>
			)}
		</div>
	);
}
