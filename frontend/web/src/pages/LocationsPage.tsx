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
	LayoutGrid,
	List,
	Phone,
	Mail,
	Building2,
	ChevronRight,
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
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "../components/ui/card";

// Import our dialog components
import { AddLocationDialog } from "../components/AddLocationDialog";
import { EditLocationDialog } from "../components/EditLocationDialog";
import { DeleteLocationDialog } from "../components/DeleteLocationDialog";
import { DataTable } from "../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { ContentContainer } from "../components/ui/content-container";
import { SearchInput } from "../components/ui/search-input";
import { FilterGroup } from "../components/ui/filter-group";
import { EmptyState } from "../components/ui/empty-state";
import { LoadingState } from "../components/ui/loading-state";
import { LocationsSidebar } from "../components/layout/SecondaryNavbar";

export default function LocationsPage() {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [locations, setLocations] = useState<Location[]>([]);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [stateFilter, setStateFilter] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
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
			...new Set(
				locations
					.map((loc) => loc.state)
					.filter((state) => state && state.trim() !== "")
			),
		] as string[];
	}, [locations]);

	// Filter locations by state, status, and search term
	const filteredLocations = useMemo(() => {
		return locations.filter((location) => {
			// Apply state filter
			if (stateFilter && location.state !== stateFilter) {
				return false;
			}

			// Apply status filter
			if (statusFilter) {
				if (statusFilter === "active" && !location.isActive) {
					return false;
				}
				if (statusFilter === "inactive" && location.isActive) {
					return false;
				}
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

	// Check if any filters are applied
	const filtersActive = !!(stateFilter || statusFilter || searchTerm);

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	// Component for sidebar
	const renderSidebar = () => {
		return (
			<LocationsSidebar
				onSearch={handleSearch}
				stateFilter={stateFilter}
				onStateFilterChange={setStateFilter}
				statusFilter={statusFilter}
				onStatusFilterChange={setStatusFilter}
				onClearFilters={handleClearFilters}
				states={uniqueStates}
			/>
		);
	};

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					message={`Loading ${
						loadingPhase === "organization" ? "organization" : "locations"
					}...`}
					type="skeleton"
					skeletonCount={6}
					skeletonHeight={80}
				/>
			</ContentContainer>
		);
	}

	return (
		<>
			{renderSidebar()}
			<ContentContainer className="flex gap-6">
				<div className="w-72 flex-shrink-0">
					<Card>
						<CardHeader>
							<CardTitle>Filters</CardTitle>
							<CardDescription>
								Filter locations by their attributes
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">State</label>
								<Select
									value={stateFilter || "all_states"}
									onValueChange={(value: string) =>
										setStateFilter(value === "all_states" ? null : value)
									}>
									<SelectTrigger>
										<SelectValue placeholder="All states" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all_states">All states</SelectItem>
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

							<div className="space-y-2">
								<label className="text-sm font-medium">Status</label>
								<Select
									value={statusFilter || "all_statuses"}
									onValueChange={(value: string) =>
										setStatusFilter(value === "all_statuses" ? null : value)
									}>
									<SelectTrigger>
										<SelectValue placeholder="All statuses" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all_statuses">All statuses</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="flex-1">
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between">
							<SearchInput
								placeholder="Search locations..."
								value={searchTerm}
								onChange={(value: string) => setSearchTerm(value)}
								className="w-64"
							/>

							<div className="flex items-center gap-2">
								<AddLocationDialog
									organizationId={organization?.id || ""}
									onLocationsAdded={handleLocationsAdded}
									trigger={
										<Button>
											<Plus className="h-4 w-4 mr-2" />
											New Location
										</Button>
									}
								/>
								<div className="flex rounded-md overflow-hidden border">
									<Button
										variant={viewMode === "cards" ? "secondary" : "ghost"}
										size="sm"
										className="rounded-none px-3"
										onClick={() => setViewMode("cards")}>
										<LayoutGrid className="h-4 w-4" />
									</Button>
									<Button
										variant={viewMode === "table" ? "secondary" : "ghost"}
										size="sm"
										className="rounded-none px-3"
										onClick={() => setViewMode("table")}>
										<List className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>

						{locations.length === 0 ? (
							<EmptyState
								title="No locations found"
								description="Start by adding locations to your organization"
								icon={<MapPin className="h-6 w-6" />}
								action={
									organization && (
										<AddLocationDialog
											organizationId={organization.id}
											onLocationsAdded={handleLocationsAdded}
											trigger={
												<Button>
													<Plus className="mr-2 h-4 w-4" />
													Add First Location
												</Button>
											}
										/>
									)
								}
							/>
						) : (
							<div className="space-y-4">
								{/* Content */}
								{filteredLocations.length === 0 ? (
									<EmptyState
										title="No locations found"
										description="Try adjusting your filters or search term"
										icon={<AlertCircle className="h-6 w-6" />}
										size="small"
										action={
											filtersActive ? (
												<Button
													variant="outline"
													onClick={handleClearFilters}>
													Clear Filters
												</Button>
											) : undefined
										}
									/>
								) : (
									<>
										{/* Table View */}
										{viewMode === "table" && (
											<DataTable
												columns={columns}
												data={filteredLocations}
											/>
										)}

										{/* Card View */}
										{viewMode === "cards" && (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												{filteredLocations.map((location) => (
													<Card
														key={location.id}
														className="hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
														onClick={() =>
															navigate(`/location-detail/${location.id}`)
														}>
														<div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
														<div className="p-4">
															<div className="flex items-start gap-4">
																<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
																	<MapPin className="h-6 w-6 text-primary" />
																</div>
																<div className="flex-1 min-w-0">
																	<div className="flex items-center justify-between gap-2 group/name">
																		<CardTitle className="text-lg truncate">
																			{location.name}
																		</CardTitle>
																		<ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-colors group-hover/name:text-primary shrink-0" />
																	</div>
																	<span className="text-sm text-muted-foreground">
																		{location.address || "No address"}
																	</span>
																</div>
															</div>
														</div>
														<div className="border-t px-4 py-3 space-y-2">
															<div className="flex items-center gap-3 text-sm">
																<Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
																<span className="truncate">
																	{location.address || "No address"}
																</span>
															</div>
															<div className="flex items-center gap-3 text-sm">
																<MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
																<span>
																	{location.city}
																	{location.city && location.state ? ", " : ""}
																	{location.state}
																	{location.zipCode
																		? ` ${location.zipCode}`
																		: ""}
																</span>
															</div>
														</div>
													</Card>
												))}
											</div>
										)}
									</>
								)}
							</div>
						)}
					</div>
				</div>
			</ContentContainer>

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
		</>
	);
}
