import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Location, LocationsAPI } from "../api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	MapPin,
	Building2,
	Mail,
	Phone,
	ArrowLeft,
	Edit,
	Trash,
	ChevronLeft,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Skeleton } from "../components/ui/skeleton";

// Update Location type to include optional fields
interface ExtendedLocation extends Location {
	phone?: string;
	email?: string;
	capacity?: number;
	hourlyRate?: number;
	notes?: string;
}

export default function LocationDetailPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const [location, setLocation] = useState<ExtendedLocation | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

	useEffect(() => {
		const fetchLocation = async () => {
			if (!locationId) return;

			try {
				setLoading(true);
				setLoadingPhase("location");
				const locationData = await LocationsAPI.getById(locationId);
				if (!locationData) {
					toast.error("Location not found");
					navigate("/locations");
					return;
				}
				setLocation(locationData);
			} catch (error) {
				console.error("Error fetching location details:", error);
				toast.error("Failed to load location details");
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchLocation();
	}, [locationId, navigate]);

	const handleDeleteLocation = async () => {
		if (!location) return;

		try {
			await LocationsAPI.delete(location.id);
			toast.success("Location deleted successfully");
			navigate("/locations");
		} catch (error) {
			console.error("Error deleting location:", error);
			toast.error("Failed to delete location");
		}
	};

	// Render loading skeleton
	const renderLoadingSkeleton = () => {
		return (
			<div className="space-y-6">
				<Skeleton className="h-10 w-48" />

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Skeleton className="h-8 w-64" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-9 w-24" />
						</div>
					</div>
				</div>

				<Skeleton className="h-32 w-full rounded-md" />
				<Skeleton className="h-48 w-full rounded-md" />
				<Skeleton className="h-40 w-full rounded-md" />
			</div>
		);
	};

	if (loading) {
		return <div className="px-4 sm:px-6 py-6">{renderLoadingSkeleton()}</div>;
	}

	if (!location) {
		return (
			<div className="px-4 sm:px-6 py-6">
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<h1 className="text-xl font-semibold mb-4">Location not found</h1>
					<Button
						variant="outline"
						onClick={() => navigate("/locations")}
						className="mt-2">
						<ArrowLeft className="mr-2 h-4 w-4" /> Back to Locations
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="px-4 sm:px-6 py-6">
			<div className="mb-6 flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate("/locations")}
					className="flex items-center">
					<ChevronLeft className="h-4 w-4 mr-1" /> Back to Locations
				</Button>
			</div>

			{/* Header with navigation and actions */}
			<div className="bg-white rounded-lg shadow-sm border mb-6">
				<div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex flex-col">
						<h1 className="text-xl font-bold">Location Details</h1>
						<p className="text-sm text-muted-foreground mt-1">
							View and manage location information
						</p>
						{loading && (
							<div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
								<Loader2 className="h-3 w-3 animate-spin" />
								<span>Loading location details...</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-1"
							onClick={() => navigate(`/edit-location/${location.id}`)}>
							<Edit className="h-4 w-4" /> Edit
						</Button>

						<AlertDialog
							open={deleteDialogOpen}
							onOpenChange={setDeleteDialogOpen}>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="h-9 text-destructive border-destructive/30">
									<Trash className="h-4 w-4 mr-2" /> Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This will permanently delete this location. This action
										cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteLocation}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</div>

			<div className="grid gap-6">
				{/* Location Header */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<div className="flex items-center gap-4">
						<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
							<MapPin className="h-8 w-8 text-primary" />
						</div>
						<div>
							<h2 className="text-2xl font-semibold">{location.name}</h2>
							<Badge
								variant={location.isActive ? "default" : "outline"}
								className="mt-1">
								{location.isActive ? "Active" : "Inactive"}
							</Badge>
						</div>
					</div>
				</div>

				{/* Address Information */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<h2 className="text-lg font-semibold mb-4">Address Information</h2>
					<div className="space-y-4">
						{location.address && (
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<Building2 className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Street Address</div>
									<div className="text-sm">{location.address}</div>
								</div>
							</div>
						)}

						{(location.city || location.state || location.zipCode) && (
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<MapPin className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">City/State/Zip</div>
									<div className="text-sm">
										{location.city}
										{location.city && location.state ? ", " : ""}
										{location.state} {location.zipCode}
									</div>
								</div>
							</div>
						)}

						{location.phone && (
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<Phone className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Phone Number</div>
									<div className="text-sm">{location.phone}</div>
								</div>
							</div>
						)}

						{location.email && (
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<Mail className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Email</div>
									<div className="text-sm">{location.email}</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Additional Information */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<h2 className="text-lg font-semibold mb-4">Organization Details</h2>
					<div className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<div className="text-sm font-medium">Organization ID</div>
								<div className="text-sm text-muted-foreground">
									{location.organizationId}
								</div>
							</div>

							{location.capacity && (
								<div>
									<div className="text-sm font-medium">Capacity</div>
									<div className="text-sm text-muted-foreground">
										{location.capacity} people
									</div>
								</div>
							)}

							{location.hourlyRate !== undefined && (
								<div>
									<div className="text-sm font-medium">Hourly Rate</div>
									<div className="text-sm text-muted-foreground">
										${location.hourlyRate.toFixed(2)}/hr
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Additional Notes */}
				{location.notes && (
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h2 className="text-lg font-semibold mb-4">Notes</h2>
						<div className="text-sm text-muted-foreground">
							{location.notes}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
