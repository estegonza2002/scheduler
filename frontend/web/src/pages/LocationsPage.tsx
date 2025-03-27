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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";

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

export default function LocationsPage() {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [locations, setLocations] = useState<Location[]>([]);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [stateFilter, setStateFilter] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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

					// Now get the locations for this organization
					const fetchedLocations = await LocationsAPI.getAll(orgs[0].id);
					setLocations(fetchedLocations);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

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
				cell: ({ row }) => <span>{row.original.address || "-"}</span>,
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

	// Filter locations based on search term and filters
	const filteredLocations = useMemo(() => {
		return locations.filter((location) => {
			// Search term filter
			const matchesSearch =
				!searchTerm ||
				location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(location.address &&
					location.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(location.city &&
					location.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(location.state &&
					location.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(location.zipCode &&
					location.zipCode.toLowerCase().includes(searchTerm.toLowerCase()));

			// State filter
			const matchesState = !stateFilter || location.state === stateFilter;

			return matchesSearch && matchesState;
		});
	}, [locations, searchTerm, stateFilter]);

	// Check if any filters are active
	const hasActiveFilters = useMemo(() => {
		return Boolean(searchTerm || stateFilter);
	}, [searchTerm, stateFilter]);

	const handleOpenEditDialog = (location: Location) => {
		setSelectedLocation(location);
		setEditDialogOpen(true);
	};

	const handleOpenDeleteDialog = (location: Location) => {
		setSelectedLocation(location);
		setDeleteDialogOpen(true);
	};

	const handleClearFilters = () => {
		setSearchTerm("");
		setStateFilter(null);
	};

	// Get state filter label
	const getStateFilterLabel = () => {
		return stateFilter || "All States";
	};

	// Get stats for cards
	const totalLocations = locations.length;
	const uniqueStateCoverage = uniqueStates.length;
	const locationsPerState =
		totalLocations > 0 && uniqueStateCoverage > 0
			? (totalLocations / uniqueStateCoverage).toFixed(1)
			: "0";

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
			<PageHeader
				title="Locations"
				description="Manage your organization's physical locations"
				actions={
					organization && (
						<LocationCreationSheet
							organizationId={organization.id}
							onLocationCreated={(newLocation) =>
								handleLocationsAdded([newLocation])
							}
							trigger={
								<Button className="h-9">
									<Plus className="h-4 w-4 mr-2" />
									Add Location
								</Button>
							}
						/>
					)
				}
			/>

			<ContentContainer>
				{/* Stats Cards */}
				<ContentSection
					title="Location Statistics"
					className="mb-6">
					<div className="grid gap-4 grid-cols-1 md:grid-cols-3">
						<div className="space-y-2">
							<h3 className="text-base font-medium">Total Locations</h3>
							<div className="text-2xl font-bold">{totalLocations}</div>
							<p className="text-xs text-muted-foreground">
								{organization?.name || "Your organization"}
							</p>
						</div>

						<div className="space-y-2">
							<h3 className="text-base font-medium">Location Coverage</h3>
							<div className="text-2xl font-bold">{uniqueStates.length}</div>
							<p className="text-xs text-muted-foreground">
								States/Provinces with locations
							</p>
						</div>

						<div className="space-y-2">
							<h3 className="text-base font-medium">Locations per State</h3>
							<div className="text-2xl font-bold">{locationsPerState}</div>
							<p className="text-xs text-muted-foreground">
								Average locations per state
							</p>
						</div>
					</div>
				</ContentSection>

				{/* Filters Section */}
				<ContentSection
					title="Filters & View Options"
					className="mb-6">
					<div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
						<div className="flex items-center space-x-2">
							<div className="border rounded-md overflow-hidden">
								<Button
									variant="ghost"
									size="sm"
									className={cn(
										"h-8 px-2 rounded-none",
										viewMode === "table" && "bg-muted"
									)}
									onClick={() => setViewMode("table")}>
									<List className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className={cn(
										"h-8 px-2 rounded-none",
										viewMode === "cards" && "bg-muted"
									)}
									onClick={() => setViewMode("cards")}>
									<LayoutGrid className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<div className="relative md:w-64">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by ID or location..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"justify-between text-left font-normal md:w-48",
											!stateFilter && "text-muted-foreground"
										)}>
										<div className="flex items-center">
											<MapPin className="mr-2 h-4 w-4" />
											{getStateFilterLabel()}
										</div>
										<ChevronDown className="h-4 w-4 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56">
									<DropdownMenuItem onSelect={() => setStateFilter(null)}>
										All States
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									{uniqueStates.map((state) => (
										<DropdownMenuItem
											key={state}
											onSelect={() => setStateFilter(state || null)}>
											{state}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Applied filters display */}
					{hasActiveFilters && (
						<div className="flex items-center gap-2 mt-4">
							<span className="text-sm font-medium text-muted-foreground">
								Filters:
							</span>
							<div className="flex flex-wrap gap-2">
								{stateFilter && (
									<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
										<MapPin className="h-3 w-3 text-muted-foreground" />
										<span>{stateFilter}</span>
										<button
											onClick={() => setStateFilter(null)}
											className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
											aria-label="Remove state filter">
											<X className="h-3 w-3 text-muted-foreground" />
										</button>
									</Badge>
								)}

								{hasActiveFilters && (
									<button
										onClick={handleClearFilters}
										className="text-xs text-muted-foreground hover:text-foreground underline">
										Clear all
									</button>
								)}
							</div>
						</div>
					)}
				</ContentSection>

				{locations.length === 0 ? (
					<EmptyState
						title="No locations found"
						description="Start by adding locations to your organization"
						icon={<MapPin className="h-6 w-6" />}
						action={
							organization && (
								<LocationCreationSheet
									organizationId={organization?.id || "org-1"}
									onLocationCreated={(newLocation) =>
										handleLocationsAdded([newLocation])
									}
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
					<ContentSection
						title="Locations"
						className="mt-6">
						{filteredLocations.length === 0 ? (
							<EmptyState
								title="No locations found"
								description="Try adjusting your filters or search term"
								icon={<AlertCircle className="h-6 w-6" />}
								size="small"
								action={
									hasActiveFilters ? (
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
										onRowClick={(location) =>
											navigate(`/locations/${location.id}`)
										}
									/>
								)}

								{/* Card View */}
								{viewMode === "cards" && (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
										{filteredLocations.map((location) => (
											<Card
												key={location.id}
												className="hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
												onClick={() => navigate(`/locations/${location.id}`)}>
												<div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
												<div className="p-4">
													<div className="flex items-start gap-4">
														<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
															<MapPin className="h-6 w-6 text-primary" />
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between gap-2 group/name">
																<h3 className="text-lg font-semibold truncate">
																	{location.name}
																</h3>
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
															{location.zipCode ? ` ${location.zipCode}` : ""}
														</span>
													</div>
												</div>
												<div className="absolute inset-0 flex items-end justify-end p-4">
													<Button
														onClick={(e) => {
															e.stopPropagation();
															navigate(`/locations/${location.id}`);
														}}
														variant="default"
														size="sm"
														className="mr-2">
														<Eye className="h-4 w-4 mr-2" /> View Details
													</Button>
												</div>
											</Card>
										))}
									</div>
								)}
							</>
						)}
					</ContentSection>
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
			</ContentContainer>
		</>
	);
}
