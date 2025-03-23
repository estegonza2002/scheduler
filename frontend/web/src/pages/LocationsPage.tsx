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
import { MapPin, MoreVertical, Plus, Search, ArrowUpDown } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";

// Import our dialog components
import { AddLocationDialog } from "../components/AddLocationDialog";
import { EditLocationDialog } from "../components/EditLocationDialog";
import { DeleteLocationDialog } from "../components/DeleteLocationDialog";
import { DataTable } from "../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function LocationsPage() {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState<boolean>(true);
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
				// In a real implementation, we would get the user's organization
				// For now, we'll use the first organization from the mock data
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);
					const fetchedLocations = await LocationsAPI.getAll(orgs[0].id);
					setLocations(fetchedLocations);
				}
			} catch (error) {
				console.error("Error fetching locations:", error);
			} finally {
				setLoading(false);
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

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-4rem)]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold text-primary">Locations</h1>
					<p className="text-muted-foreground mt-1">
						Manage store locations and their details
					</p>
				</div>
				{organization && (
					<AddLocationDialog
						organizationId={organization.id}
						onLocationsAdded={handleLocationsAdded}
					/>
				)}
			</div>

			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Location Directory</h2>
			</div>

			<div className="rounded-md bg-background">
				{locations.length === 0 ? (
					<div className="text-center py-12 border-2 border-dashed rounded-lg">
						<h3 className="text-lg font-medium mb-2">No locations found</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Start by adding locations to your organization
						</p>
						{organization && (
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
						)}
					</div>
				) : (
					<DataTable
						columns={columns}
						data={locations}
						searchKey="name"
						searchPlaceholder="Search locations..."
					/>
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
