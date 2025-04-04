import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Location, Organization } from "@/api";
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

// Import the location context hook
import { useLocation } from "@/lib/location";

export default function LocationsPage() {
	const { updateHeader } = useHeader();
	const [searchParams] = useSearchParams();
	const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
	const organizationId = useOrganizationId();

	// Use state from location context
	const { locations, isLoading: loading, refreshLocations } = useLocation();

	// Pagination state for card view
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	const navigate = useNavigate();

	// Dialog states
	const [selectedLocation, setSelectedLocation] = useState<Location | null>(
		null
	);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	// Define dialog handlers *before* columns useMemo
	const handleOpenEditDialog = useCallback((location: Location) => {
		setSelectedLocation(location);
		setEditDialogOpen(true);
	}, []);

	const handleOpenDeleteDialog = useCallback((location: Location) => {
		setSelectedLocation(location);
		setDeleteDialogOpen(true);
	}, []);

	// Set the page header
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
						onLocationCreated={(newLocation) => {
							console.log("Location created via dialog:", newLocation);
							refreshLocations();
						}}
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
	}, [updateHeader, organizationId, navigate, refreshLocations]);

	// Refactored subscriptions effect: directly manages channel based on organizationId
	useEffect(() => {
		if (!organizationId) {
			console.log("Subscription Effect: No organization ID, skipping setup.");
			return; // Return undefined, no cleanup needed if no channel was created
		}

		console.log(
			`Subscription Effect: Setting up channel for org ${organizationId}`
		);

		// Create the new subscription channel
		const channel = supabase
			.channel(`locations-changes-${organizationId}`) // Unique channel name per org
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "locations",
					filter: `organization_id=eq.${organizationId}`,
				},
				(payload) => {
					console.log("Location change detected via Supabase RT:", payload);
					refreshLocations(); // Refresh context data
					// Avoid toast on every update, might be too noisy
					// toast.info("Locations list updated.");
				}
			)
			.subscribe((status, err) => {
				console.log(
					`Subscription Effect: Channel status for org ${organizationId}: ${status}`
				);
				if (status === "SUBSCRIBED") {
					// Connection successful
				} else if (status === "CHANNEL_ERROR") {
					console.error("Subscription error:", err);
					toast.error("Real-time connection error. Refresh may be needed.");
				} else if (status === "TIMED_OUT") {
					toast.warning(
						"Real-time connection timed out. Refresh may be needed."
					);
				}
			});

		// Cleanup function: This runs when organizationId changes or component unmounts
		return () => {
			console.log(
				`Subscription Effect: Cleaning up channel for org ${organizationId}`
			);
			if (channel) {
				supabase.removeChannel(channel);
			}
		};
		// This useEffect now only depends on organizationId and the stable refreshLocations
	}, [organizationId, refreshLocations]);

	// Define columns *after* dialog handlers
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
						<div className="relative flex justify-end">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 p-0 hover:bg-accent/80"
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
		[handleOpenEditDialog, handleOpenDeleteDialog]
	);

	// Calculate displayed locations for card pagination
	const displayedLocations = useMemo(() => {
		if (viewMode === "cards") {
			const startIndex = (currentPage - 1) * pageSize;
			const endIndex = startIndex + pageSize;
			return locations.slice(startIndex, endIndex);
		}
		return locations;
	}, [locations, viewMode, currentPage, pageSize]);

	// Pagination handlers
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1);
	};

	// Calculation for pagination display
	const totalPages = Math.ceil(locations.length / pageSize);
	const totalLocationsCount = locations.length;
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
					<title>Loading Locations | Scheduler</title>
				</Helmet>
				<LoadingState
					message={"Loading locations..."}
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
				<ContentContainer>
					<EmptyState
						icon={<MapPin className="h-8 w-8" />}
						title="No locations found"
						description="Get started by adding your first location."
						action={
							<div className="flex gap-2">
								<LocationDialog
									organizationId={organizationId}
									onLocationCreated={(newLocation) => {
										console.log(
											"Location created via empty state:",
											newLocation
										);
										refreshLocations();
									}}
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
				</ContentContainer>
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
									onSuccess={(updatedLocation) => {
										console.log(
											"Location updated via dialog:",
											updatedLocation
										);
										refreshLocations();
									}}
								/>
								<DeleteLocationDialog
									open={deleteDialogOpen}
									onOpenChange={setDeleteDialogOpen}
									location={selectedLocation}
									onLocationDeleted={(locationId) => {
										console.log("Location deleted via dialog:", locationId);
										refreshLocations();
									}}
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
