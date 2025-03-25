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
	ChevronLeft,
	Edit,
	Trash,
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

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LoadingState } from "../components/ui/loading-state";

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

	// Back button to return to locations list
	const BackButton = (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => navigate("/locations")}
			className="mb-2">
			<ChevronLeft className="h-4 w-4 mr-1" /> Back to Locations
		</Button>
	);

	// Action buttons for the header
	const ActionButtons = (
		<>
			<Button
				variant="outline"
				size="sm"
				className="h-9 gap-1"
				onClick={() => navigate(`/edit-location/${location?.id}`)}>
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
							This will permanently delete this location. This action cannot be
							undone.
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
		</>
	);

	if (loading) {
		return (
			<ContentContainer>
				{BackButton}
				<LoadingState
					type="skeleton"
					skeletonCount={4}
					skeletonHeight={60}
					message="Loading location information..."
				/>
			</ContentContainer>
		);
	}

	if (!location) {
		return (
			<ContentContainer>
				{BackButton}
				<ContentSection
					title="Location not found"
					description="The requested location could not be found."
					footer={
						<Button
							variant="outline"
							onClick={() => navigate("/locations")}
							className="mt-2">
							Back to Locations
						</Button>
					}>
					<p>
						The location you're looking for may have been removed or doesn't
						exist.
					</p>
				</ContentSection>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			{BackButton}


			<div className="grid gap-6 mt-6">
				{/* Location Header */}
				<ContentSection
					title="Overview"
					flat>
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
				</ContentSection>

				{/* Address Information */}
				<ContentSection title="Address Information">
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
									<div className="text-sm font-medium">Phone</div>
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
				</ContentSection>

				{/* Contact Information (if it exists) */}
				{(location.phone || location.email) && (
					<ContentSection title="Contact Information">
						<div className="space-y-4">
							{location.phone && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Phone className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Phone</div>
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
					</ContentSection>
				)}

				{/* Additional Information (if it exists) */}
				{(location.capacity || location.hourlyRate || location.notes) && (
					<ContentSection title="Additional Information">
						<div className="space-y-4">
							{location.capacity && (
								<div className="flex items-start gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center mt-1">
										<Building2 className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Capacity</div>
										<div className="text-sm">{location.capacity} employees</div>
									</div>
								</div>
							)}

							{location.hourlyRate && (
								<div className="flex items-start gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center mt-1">
										<Mail className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Hourly Rate</div>
										<div className="text-sm">${location.hourlyRate}/hour</div>
									</div>
								</div>
							)}

							{location.notes && (
								<div className="flex items-start gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center mt-1">
										<MapPin className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Notes</div>
										<div className="text-sm whitespace-pre-wrap">
											{location.notes}
										</div>
									</div>
								</div>
							)}
						</div>
					</ContentSection>
				)}
			</div>
		</ContentContainer>
	);
}
