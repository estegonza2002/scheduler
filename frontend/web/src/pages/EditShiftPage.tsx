import { useState, useEffect } from "react";
import {
	Link,
	useParams,
	useSearchParams,
	useNavigate,
} from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Shift, ShiftsAPI, LocationsAPI, Location } from "../api";
import { format, parseISO } from "date-fns";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { ContentContainer } from "../components/ui/content-container";
import { FormSection } from "../components/ui/form-section";
import { LoadingState } from "../components/ui/loading-state";
import { PageHeader } from "../components/ui/page-header";

export default function EditShiftPage() {
	const { shiftId } = useParams<{ shiftId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
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

				// Set form values
				const shiftDate = parseISO(shiftData.start_time);
				setDate(format(shiftDate, "yyyy-MM-dd"));
				setStartTime(format(parseISO(shiftData.start_time), "HH:mm"));
				setEndTime(format(parseISO(shiftData.end_time), "HH:mm"));
				setLocationId(shiftData.location_id || "none");
				setNotes(shiftData.description || "");

				// Load locations
				const organizationId = searchParams.get("organizationId") || "org-1";
				const locationsData = await LocationsAPI.getAll(organizationId);
				setLocations(locationsData);
			} catch (error) {
				console.error("Error loading shift data:", error);
				toast.error("Failed to load shift data");
			} finally {
				setLoading(false);
			}
		}

		loadShiftData();
	}, [shiftId, searchParams, navigate]);

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!shift || !date || !startTime || !endTime || !shiftId) {
			toast.error("Please fill out all required fields");
			return;
		}

		try {
			setSaving(true);

			// Combine date and times
			const startDateTime = new Date(`${date}T${startTime}`).toISOString();
			const endDateTime = new Date(`${date}T${endTime}`).toISOString();

			// Update shift
			await ShiftsAPI.updateShift(shiftId, {
				...shift,
				start_time: startDateTime,
				end_time: endDateTime,
				location_id:
					locationId === "none" ? undefined : locationId || undefined,
				description: notes,
			});

			toast.success("Shift updated successfully");
			navigate(`/shifts/${shiftId}`);
		} catch (error) {
			console.error("Error saving shift:", error);
			toast.error("Failed to update shift");
		} finally {
			setSaving(false);
		}
	};

	// Back button
	const BackButton = (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => navigate(`/shifts/${shiftId}`)}
			className="mb-2">
			<ChevronLeft className="h-4 w-4 mr-1" /> Back to Details
		</Button>
	);

	// Actions for the header
	const ActionButtons = (
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
		return (
			<>
				<PageHeader
					title="Edit Shift"
					description="Loading shift information..."
					showBackButton={true}
				/>
				<ContentContainer>
					<LoadingState
						type="spinner"
						message="Loading shift information..."
						className="py-12"
					/>
				</ContentContainer>
			</>
		);
	}

	return (
		<>
			<PageHeader
				title="Edit Shift"
				description="Modify shift details and schedule"
				actions={ActionButtons}
				showBackButton={true}
			/>
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
		</>
	);
}
