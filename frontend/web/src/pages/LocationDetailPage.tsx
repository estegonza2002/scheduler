import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Location, LocationsAPI } from "../api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	MapPin,
	Building2,
	Mail,
	Phone,
	ArrowLeft,
	Edit,
	Trash,
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
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

	useEffect(() => {
		const fetchLocation = async () => {
			if (!locationId) return;

			try {
				setLoading(true);
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

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!location) {
		return (
			<div className="container py-8">
				<h1 className="text-2xl font-bold">Location not found</h1>
				<Button
					variant="outline"
					onClick={() => navigate("/locations")}
					className="mt-4">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Locations
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6">
			{/* Header with navigation and actions */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate("/locations")}
						className="h-9">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Locations
					</Button>
					<h1 className="text-2xl font-bold ml-2">Location Details</h1>
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
									This will permanently delete this location. This action cannot
									be undone.
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
				<Card>
					<CardHeader>
						<CardTitle>Address Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
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
					</CardContent>
				</Card>

				{/* Additional Information */}
				<Card>
					<CardHeader>
						<CardTitle>Organization Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
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
					</CardContent>
				</Card>

				{/* Additional Notes */}
				{location.notes && (
					<Card>
						<CardHeader>
							<CardTitle>Notes</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-muted-foreground">
								{location.notes}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
