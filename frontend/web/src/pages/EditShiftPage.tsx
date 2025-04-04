import { useState, useEffect } from "react";
import {
	Link,
	useParams,
	useSearchParams,
	useNavigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Shift, ShiftsAPI, LocationsAPI, Location } from "@/api";
import { format, parseISO } from "date-fns";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { ContentContainer } from "@/components/ui/content-container";
import { FormSection } from "@/components/ui/form-section";
import { LoadingState } from "@/components/ui/loading-state";
import { useHeader } from "@/lib/header-context";
import { useOrganization } from "@/lib/organization";

export default function EditShiftPage() {
	const { shiftId } = useParams<{ shiftId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const {
		organization,
		isLoading: isOrgLoading,
		getCurrentOrganizationId,
	} = useOrganization();
	const [shift, setShift] = useState<Shift | null>(null);
	const [locations, setLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Form fields
	const [date, setDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [locationId, setLocationId] = useState("none");
	const [notes, setNotes] = useState("");

	// Additional form fields
	const returnUrl = searchParams.get("returnUrl") || "/";
	const locationIdParam = searchParams.get("locationId") || "";

	// Define loadLocations function
	const loadLocations = async (orgId: string) => {
		try {
			const locationsData = await LocationsAPI.getAll(orgId);
			setLocations(locationsData);
		} catch (error) {
			console.error("Error loading locations:", error);
			toast.error("Failed to load locations");
			setLocations([]); // Clear locations on error
		}
	};

	// Load shift data
	useEffect(() => {
		async function loadShiftData() {
			if (!shiftId) return;

			try {
				setLoading(true);

				// Load shift data
				const shiftData = await ShiftsAPI.getShiftById(shiftId);
				if (!shiftData) {
					toast.error("Shift not found");
					navigate("/schedule");
					return;
				}

				setShift(shiftData);

				// Set form values using camelCase
				const shiftStartDate = parseISO(shiftData.startTime);
				const shiftEndDate = parseISO(shiftData.endTime);
				setDate(format(shiftStartDate, "yyyy-MM-dd"));
				setStartTime(format(shiftStartDate, "HH:mm"));
				setEndTime(format(shiftEndDate, "HH:mm"));
				setLocationId(shiftData.locationId || "none");
				setNotes(shiftData.description || ""); // Use description field

				// Load locations (now defined above)
				const orgId = getCurrentOrganizationId();
				if (orgId && !isOrgLoading) {
					loadLocations(orgId);
				} else if (!isOrgLoading) {
					toast.error("Could not determine organization to load locations.");
					setLocations([]);
				}
			} catch (error) {
				console.error("Error loading shift data:", error);
				toast.error("Failed to load shift data");
			} finally {
				setLoading(false);
			}
		}

		loadShiftData();
	}, [shiftId, navigate, getCurrentOrganizationId, isOrgLoading]); // Removed searchParams as direct dependency if not needed for shift loading itself

	// Update header content
	useEffect(() => {
		// Actions for the header
		const actionButtons = (
			<Button
				type="submit"
				form="edit-shift-form"
				disabled={saving}
				className="gap-2">
				{saving && (
					<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
				)}
				<Save className="h-4 w-4 mr-1" /> Save Changes
			</Button>
		);

		if (loading) {
			updateHeader({
				title: "Edit Shift",
				description: "Loading shift information...",
				showBackButton: true,
			});
		} else {
			updateHeader({
				title: "Edit Shift",
				description: "Modify shift details and schedule",
				actions: actionButtons,
				showBackButton: true,
			});
		}
	}, [loading, saving, updateHeader]);

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!shiftId) return;

		const currentOrgId = getCurrentOrganizationId();
		if (!currentOrgId) {
			toast.error("Organization context not available. Cannot save shift.");
			return;
		}

		try {
			setSaving(true);
			const startDateTime = `${date}T${startTime}`;
			const endDateTime = `${date}T${endTime}`;

			await ShiftsAPI.updateShift(shiftId, {
				startTime: new Date(startDateTime).toISOString(),
				endTime: new Date(endDateTime).toISOString(),
				locationId: locationId !== "none" ? locationId : undefined,
				// Use description field instead of notes for update
				description: notes,
				organizationId: currentOrgId,
			});

			toast.success("Shift updated successfully");
			navigate(`/shifts/${shiftId}`);
		} catch (error) {
			console.error("Error updating shift:", error);
			toast.error("Failed to update shift");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					type="spinner"
					message="Loading shift information..."
					className="py-12"
				/>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			<div className="max-w-3xl mx-auto">
				<form
					id="edit-shift-form"
					onSubmit={handleSubmit}
					className="space-y-8">
					<FormSection
						title="Date and Time"
						description="Set when this shift will start and end">
						{/* Date */}
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								required
							/>
						</div>

						{/* Time Range */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="startTime">Start Time</Label>
								<Input
									id="startTime"
									type="time"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endTime">End Time</Label>
								<Input
									id="endTime"
									type="time"
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
									required
								/>
							</div>
						</div>
					</FormSection>

					<FormSection
						title="Location"
						description="Assign a location for this shift">
						<div className="space-y-2">
							<Label htmlFor="location">Location</Label>
							<Select
								value={locationId}
								onValueChange={setLocationId}>
								<SelectTrigger id="location">
									<SelectValue placeholder="Select a location" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No location</SelectItem>
									{locations.map((loc) => (
										<SelectItem
											key={loc.id}
											value={loc.id}>
											{loc.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</FormSection>

					<FormSection
						title="Notes"
						description="Add any additional information or instructions">
						<div className="space-y-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Add any additional notes or instructions..."
								rows={4}
							/>
						</div>
					</FormSection>

					{/* Form actions at the bottom */}
					<div className="flex justify-end gap-4 pt-6 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate(`/shifts/${shiftId}`)}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={saving}
							className="gap-2">
							{saving && (
								<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
							)}
							<Save className="h-4 w-4 mr-1" /> Save Changes
						</Button>
					</div>
				</form>
			</div>
		</ContentContainer>
	);
}
