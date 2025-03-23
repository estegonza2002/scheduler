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
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";

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
				accessorKey: "state",
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
						{row.original.state}{" "}
						{row.original.zipCode && `${row.original.zipCode}`}
					</>
				),
			},
			{
				accessorKey: "isActive",
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
					<Badge variant={row.original.isActive ? "default" : "outline"}>
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
										Edit
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onSelect={() => handleOpenDeleteDialog(location)}>
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
		return <div className="px-4 sm:px-6 py-6">{renderLoadingSkeleton()}</div>;
	}

	return (
		<div className="px-4 sm:px-6 py-6">
			{/* Header with title */}
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Locations</h1>
			</div>

			{/* Location management header card */}
			<div className="bg-white rounded-lg shadow-sm border mb-6">
				<div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-bold">Location Directory</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Manage store locations and their details
						</p>
						{loading && (
							<div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
								<Loader2 className="h-3 w-3 animate-spin" />
								<span>
									{loadingPhase === "organization"
										? "Loading organization..."
										: "Loading locations..."}
								</span>
							</div>
						)}
					</div>
					{organization && (
						<AddLocationDialog
							organizationId={organization.id}
							onLocationsAdded={handleLocationsAdded}
							trigger={
								<Button
									variant="default"
									className="bg-black hover:bg-black/90 text-white">
									<Plus className="h-4 w-4 mr-2" />
									Add Location
								</Button>
							}
						/>
					)}
				</div>
			</div>

			{/* Location data table container */}
			<div className="bg-white rounded-lg shadow-sm border">
				{locations.length === 0 ? (
					<div className="text-center py-12 border-2 border-dashed rounded-lg m-4">
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
					<div className="p-4">
						<DataTable
							columns={columns}
							data={locations}
							searchKey="name"
							searchPlaceholder="Search locations..."
						/>
					</div>
				)}
			</div>

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
