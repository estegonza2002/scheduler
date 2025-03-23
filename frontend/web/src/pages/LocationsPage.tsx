import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Location, LocationsAPI, OrganizationsAPI, Organization } from "../api";
import { MapPin, MoreVertical, Plus, Search } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";

// Import our dialog components
import { AddLocationDialog } from "../components/AddLocationDialog";
import { EditLocationDialog } from "../components/EditLocationDialog";
import { DeleteLocationDialog } from "../components/DeleteLocationDialog";

export default function LocationsPage() {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState<boolean>(true);
	const [locations, setLocations] = useState<Location[]>([]);
	const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const navigate = useNavigate();

	// Dialog states
	const [selectedLocation, setSelectedLocation] = useState<Location | null>(
		null
	);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
					setFilteredLocations(fetchedLocations);
				}
			} catch (error) {
				console.error("Error fetching locations:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		// Filter locations when search query changes
		if (searchQuery.trim() === "") {
			setFilteredLocations(locations);
		} else {
			const query = searchQuery.toLowerCase();
			const filtered = locations.filter(
				(location) =>
					location.name.toLowerCase().includes(query) ||
					location.address?.toLowerCase().includes(query) ||
					location.city?.toLowerCase().includes(query) ||
					location.state?.toLowerCase().includes(query) ||
					location.zipCode?.toLowerCase().includes(query)
			);
			setFilteredLocations(filtered);
		}
	}, [searchQuery, locations]);

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
		<div className="p-6 max-w-7xl mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold text-primary">Locations</h1>
					<p className="text-muted-foreground mt-1">
						Manage your business locations with Google Places integration
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
				<div className="flex items-center gap-2">
					<div className="relative w-64">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search locations..."
							className="pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
			</div>

			<p className="text-muted-foreground mb-4">
				{filteredLocations.length} total locations
			</p>

			{filteredLocations.length === 0 ? (
				<div className="text-center py-12 border-2 border-dashed rounded-lg">
					<h3 className="text-lg font-medium mb-2">No locations found</h3>
					<p className="text-sm text-muted-foreground mb-4">
						{locations.length === 0
							? "Start by adding locations to your organization"
							: "Try a different search query"}
					</p>
					{locations.length === 0 && organization && (
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
				<div className="border rounded-md bg-background">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Address</TableHead>
								<TableHead>City</TableHead>
								<TableHead>State/ZIP</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-[80px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredLocations.map((location) => (
								<TableRow
									key={location.id}
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => navigate(`/location-detail/${location.id}`)}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
												<MapPin className="h-4 w-4 text-primary" />
											</div>
											<span>{location.name}</span>
										</div>
									</TableCell>
									<TableCell>{location.address || "-"}</TableCell>
									<TableCell>{location.city || "-"}</TableCell>
									<TableCell>
										{location.state} {location.zipCode && `${location.zipCode}`}
									</TableCell>
									<TableCell>
										<Badge variant={location.isActive ? "default" : "outline"}>
											{location.isActive ? "Active" : "Inactive"}
										</Badge>
									</TableCell>
									<TableCell onClick={(e) => e.stopPropagation()}>
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
													onClick={() =>
														navigate(`/location-detail/${location.id}`)
													}>
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
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
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
