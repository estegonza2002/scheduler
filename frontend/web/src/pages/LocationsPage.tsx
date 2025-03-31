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
import { LocationCreationSheet } from "@/components/LocationCreationSheet";
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

	// Set the page header on component mount
	useEffect(() => {
		updateHeader({
			title: "Locations",
			description: "Manage your organization's locations",
			actions: (
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
			),
		});
	}, [updateHeader, organizationId, handleLocationsAdded]);

	// Fetch data
	const fetchData = async () => {
		try {
			setLoading(true);
			setLoadingPhase("organization");
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

			<ContentContainer>
				<ContentSection title="Locations">
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
									<div className="relative">
										<LocationCard
											location={location}
											interactive={true}
											variant="detailed"
											onClick={() => navigate(`/locations/${location.id}`)}
											className="cursor-pointer hover:shadow-sm transition-all hover:border-primary">
											<div className="flex justify-end mt-4">
												<Button
													variant="outline"
													size="sm"
													className="w-full"
													onClick={(e) => {
														e.stopPropagation();
														navigate(`/locations/${location.id}`);
													}}>
													<Eye className="h-4 w-4 mr-2" />
													View Details
												</Button>
											</div>
										</LocationCard>
										<div className="absolute top-2 right-2">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
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
														className="text-destructive hover:text-destructive">
														<Trash className="h-4 w-4 mr-2" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								),
							}}
						/>
					)}
				</ContentSection>
			</ContentContainer>

			{/* Edit Location Dialog */}
			{selectedLocation && (
				<>
					<LocationFormDialog
						mode="edit"
						location={selectedLocation}
						onSuccess={handleLocationUpdated}
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
