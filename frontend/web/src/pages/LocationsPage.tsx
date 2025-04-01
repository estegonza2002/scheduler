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
	Eye,
	MoreHorizontal,
	Edit,
	Trash,
	User,
	PlusCircle,
	Upload,
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
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";

// Import our dialog components
import { EditLocationDialog } from "@/components/EditLocationDialog";
import { DeleteLocationDialog } from "@/components/DeleteLocationDialog";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { LocationDialog } from "@/components/LocationDialog";
import { useHeader } from "@/lib/header-context";

import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LocationCard } from "@/components/ui/location-card";

import { useOrganizationId } from "@/hooks/useOrganizationId";
import { LocationFormDialog } from "@/components/LocationFormDialog";

export default function LocationsPage() {
	const { updateHeader } = useHeader();
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [locations, setLocations] = useState<Location[]>([]);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
	const organizationId = useOrganizationId();

	// Add state for real-time subscription
	const [locationsChannel, setLocationsChannel] =
		useState<RealtimeChannel | null>(null);

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
		console.log("Locations added:", newLocations);
		setLocations((prev) => [...prev, ...newLocations]);
	}, []);

	const handleLocationUpdated = useCallback((updatedLocation: Location) => {
		console.log("Location updated:", updatedLocation);
		setLocations((prev) =>
			prev.map((loc) => (loc.id === updatedLocation.id ? updatedLocation : loc))
		);
	}, []);

	const handleLocationDeleted = useCallback((locationId: string) => {
		console.log("Location deleted:", locationId);
		setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
	}, []);

	// Load location data function
	const loadLocationData = useCallback(async () => {
		try {
			setLoading(true);
			setLoadingPhase("organization");
			const orgs = await OrganizationsAPI.getAll();
			if (orgs.length > 0) {
				setOrganization(orgs[0]);
				setLoadingPhase("locations");

				// Now get the locations for this organization
				const fetchedLocations = await LocationsAPI.getAll(organizationId);
				console.log("Fetched locations:", fetchedLocations);
				setLocations(fetchedLocations);
			}
		} catch (error) {
			console.error("Error fetching location data:", error);
			toast.error("Failed to load locations");
		} finally {
			setLoading(false);
		}
	}, [organizationId]);

	// Setup real-time subscriptions
	const setupRealtimeSubscriptions = useCallback(() => {
		if (!organizationId) {
			console.log("No organization ID available for subscriptions");
			return;
		}

		console.log("Setting up real-time subscriptions for locations");

		// Subscribe to locations table changes
		const locationsSubscription = supabase
			.channel("locations-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "locations",
					filter: `organization_id=eq.${organizationId}`,
				},
				(payload) => {
					console.log("Location change detected:", payload);

					if (payload.eventType === "INSERT") {
						console.log("New location added:", payload.new);
						// Map DB data to Location object format
						const newLocation = {
							id: payload.new.id,
							name: payload.new.name,
							address: payload.new.address,
							city: payload.new.city,
							state: payload.new.state,
							zipCode: payload.new.zip_code,
							isActive: payload.new.is_active,
							organizationId: payload.new.organization_id,
						} as Location;

						handleLocationsAdded([newLocation]);
					} else if (payload.eventType === "UPDATE") {
						console.log("Location updated:", payload.new);
						// Map DB data to Location object format
						const updatedLocation = {
							id: payload.new.id,
							name: payload.new.name,
							address: payload.new.address,
							city: payload.new.city,
							state: payload.new.state,
							zipCode: payload.new.zip_code,
							isActive: payload.new.is_active,
							organizationId: payload.new.organization_id,
						} as Location;

						handleLocationUpdated(updatedLocation);
					} else if (payload.eventType === "DELETE") {
						console.log("Location deleted:", payload.old);
						handleLocationDeleted(payload.old.id);
					}
				}
			)
			.subscribe((status) => {
				console.log("Locations subscription status:", status);
			});

		// Save channel reference for cleanup
		setLocationsChannel(locationsSubscription);
	}, [
		organizationId,
		handleLocationsAdded,
		handleLocationUpdated,
		handleLocationDeleted,
	]);

	// Set the page header on component mount
	useEffect(() => {
		updateHeader({
			title: "Locations",
			description: "Manage your organization's locations",
			actions: (
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => navigate("/locations/bulk-import")}>
						<Upload className="h-4 w-4 mr-2" />
						Bulk Import
					</Button>
					<LocationDialog
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
			),
		});
	}, [updateHeader, organizationId, handleLocationsAdded, navigate]);

	// Fetch data and setup subscriptions
	useEffect(() => {
		// Initial data load
		loadLocationData();

		// Setup real-time subscriptions
		setupRealtimeSubscriptions();

		// Cleanup subscriptions when component unmounts
		return () => {
			console.log("Cleaning up real-time subscriptions");
			if (locationsChannel) {
				locationsChannel.unsubscribe();
			}
		};
	}, [organizationId, loadLocationData, setupRealtimeSubscriptions]);

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
						<span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
							<MapPin className="h-4 w-4 text-primary" />
						</span>
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
						<div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0 hover:bg-accent/80 absolute top-2 right-2"
										onClick={(e) => e.stopPropagation()}>
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											handleOpenEditDialog(location);
										}}>
										<Edit className="h-4 w-4 mr-2" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											handleOpenDeleteDialog(location);
										}}
										className="text-destructive">
										<Trash className="h-4 w-4 mr-2" />
										Delete
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

	const displayedLocations = useMemo(() => {
		if (viewMode === "cards") {
			// Calculate start and end index based on current page
			const startIndex = (currentPage - 1) * pageSize;
			const endIndex = startIndex + pageSize;

			// Return paginated slice of locations
			return locations.slice(startIndex, endIndex);
		}

		// If in table view, return all locations
		return locations;
	}, [locations, viewMode, currentPage, pageSize]);

	// Handle pagination
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1); // Reset to first page when page size changes
	};

	// Handle opening dialogs for location management
	const handleOpenEditDialog = (location: Location) => {
		setSelectedLocation(location);
		setEditDialogOpen(true);
	};

	const handleOpenDeleteDialog = (location: Location) => {
		setSelectedLocation(location);
		setDeleteDialogOpen(true);
	};

	// Get the total number of pages for card view pagination
	const totalPages = Math.ceil(locations.length / pageSize);

	// Calculate total locations based on applied filters
	const totalLocationsCount = locations.length;

	// Get the index of locations for display "Showing X to Y of Z locations"
	const startIndex = Math.min(
		(currentPage - 1) * pageSize + 1,
		totalLocationsCount
	);
	const endIndex = Math.min(startIndex + pageSize - 1, totalLocationsCount);

	const countDisplay =
		totalLocationsCount > 0
			? `Showing ${startIndex} to ${endIndex} of ${totalLocationsCount} locations`
			: "0";

	if (loading) {
		return (
			<>
				<Helmet>
					<title>Locations | Scheduler</title>
				</Helmet>
				<LoadingState
					message={`Loading ${
						loadingPhase === "organization" ? "organization" : "locations"
					}...`}
					type="spinner"
					className="py-12"
				/>
			</>
		);
	}

	return (
		<>
			<Helmet>
				<title>Locations | Scheduler</title>
			</Helmet>

			{!loading && locations.length === 0 ? (
				<EmptyState
					icon={<MapPin className="h-8 w-8" />}
					title="No locations found"
					description="Get started by adding your first location."
					action={
						<div className="flex gap-2">
							<LocationDialog
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
							<Button
								variant="outline"
								onClick={() => navigate("/locations/bulk-import")}>
								<Upload className="h-4 w-4 mr-2" />
								Bulk Import
							</Button>
						</div>
					}
				/>
			) : (
				<ContentContainer>
					<ContentSection title="All Locations">
						<div className="mb-6 flex flex-col gap-y-2 sm:flex-row sm:justify-between sm:items-center">
							<div>
								<p className="text-sm text-muted-foreground">
									{totalLocationsCount} total locations
								</p>
							</div>

							<div className="flex items-center space-x-2">
								<Button
									variant={viewMode === "cards" ? "default" : "outline"}
									size="sm"
									onClick={() => setViewMode("cards")}
									className="h-8 px-2 lg:px-3">
									<LayoutGrid className="h-4 w-4" />
									<span className="ml-2 hidden lg:inline">Cards</span>
								</Button>
								<Button
									variant={viewMode === "table" ? "default" : "outline"}
									size="sm"
									onClick={() => setViewMode("table")}
									className="h-8 px-2 lg:px-3">
									<List className="h-4 w-4" />
									<span className="ml-2 hidden lg:inline">Table</span>
								</Button>
							</div>
						</div>

						{selectedLocation && (
							<>
								<LocationFormDialog
									mode="edit"
									open={editDialogOpen}
									onOpenChange={setEditDialogOpen}
									location={selectedLocation}
									onSuccess={handleLocationUpdated}
								/>

								<DeleteLocationDialog
									open={deleteDialogOpen}
									onOpenChange={setDeleteDialogOpen}
									location={selectedLocation}
									onLocationDeleted={handleLocationDeleted}
								/>
							</>
						)}

						{viewMode === "cards" ? (
							<div>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{displayedLocations.map((location) => (
										<LocationCard
											key={location.id}
											location={location}
											interactive={true}
											variant="compact"
											size="sm"
											onClick={() => navigate(`/locations/${location.id}`)}
											className="cursor-pointer hover:shadow-sm transition-all hover:border-primary relative"
										/>
									))}
								</div>

								{totalPages > 1 && (
									<div className="mt-6 flex items-center justify-between">
										<p className="text-sm text-muted-foreground">
											{countDisplay}
										</p>

										<div className="flex items-center space-x-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handlePageChange(currentPage - 1)}
												disabled={currentPage === 1}>
												Previous
											</Button>
											<span className="text-sm">
												Page {currentPage} of {totalPages}
											</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handlePageChange(currentPage + 1)}
												disabled={currentPage === totalPages}>
												Next
											</Button>
										</div>
									</div>
								)}
							</div>
						) : (
							<div>
								<DataTable
									columns={columns}
									data={locations}
									searchPlaceholder="Search locations..."
									searchKey="name"
								/>
							</div>
						)}
					</ContentSection>
				</ContentContainer>
			)}
		</>
	);
}
