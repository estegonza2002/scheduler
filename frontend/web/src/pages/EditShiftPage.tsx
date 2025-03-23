import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Shift, ShiftsAPI, LocationsAPI, Location } from "../api";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditShiftPage() {
	const { shiftId } = useParams<{ shiftId: string }>();
	const [searchParams] = useSearchParams();
	const [shift, setShift] = useState<Shift | null>(null);
	const [locations, setLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [redirectPath, setRedirectPath] = useState<string | null>(null);

	// Form fields
	const [date, setDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [locationId, setLocationId] = useState("");
	const [notes, setNotes] = useState("");

	// Load shift data
	useEffect(() => {
		async function loadShiftData() {
			if (!shiftId) return;

			try {
				setLoading(true);

				// Load shift data
				const shiftData = await ShiftsAPI.getById(shiftId);
				if (!shiftData) {
					toast.error("Shift not found");
					setRedirectPath("/schedule");
					return;
				}

				setShift(shiftData);

				// Set form values
				const shiftDate = parseISO(shiftData.startTime);
				setDate(format(shiftDate, "yyyy-MM-dd"));
				setStartTime(format(parseISO(shiftData.startTime), "HH:mm"));
				setEndTime(format(parseISO(shiftData.endTime), "HH:mm"));
				setLocationId(shiftData.locationId || "");
				setNotes(shiftData.notes || "");

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
	}, [shiftId, searchParams]);

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
			await ShiftsAPI.update({
				...shift,
				startTime: startDateTime,
				endTime: endDateTime,
				locationId: locationId || undefined,
				notes: notes,
			});

			toast.success("Shift updated successfully");
			setRedirectPath(`/shifts/${shiftId}`);
		} catch (error) {
			console.error("Error saving shift:", error);
			toast.error("Failed to update shift");
		} finally {
			setSaving(false);
		}
	};

	// Handle redirect after successful update
	useEffect(() => {
		if (redirectPath) {
			window.location.href = redirectPath;
		}
	}, [redirectPath]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="px-4 sm:px-6 py-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Edit Shift</h1>
				<Link
					to={`/shifts/${shiftId}`}
					className="inline-flex items-center gap-2 h-9 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
					<ArrowLeft className="h-4 w-4" /> Back to Details
				</Link>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Shift Information</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="space-y-6">
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
						<div className="grid grid-cols-2 gap-4">
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

						{/* Location */}
						<div className="space-y-2">
							<Label htmlFor="location">Location</Label>
							<Select
								value={locationId}
								onValueChange={setLocationId}>
								<SelectTrigger id="location">
									<SelectValue placeholder="Select a location" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">No location</SelectItem>
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

						{/* Notes */}
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

						{/* Actions */}
						<div className="flex justify-end gap-2 pt-4">
							<Link
								to={`/shifts/${shiftId}`}
								className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
								Cancel
							</Link>
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
				</CardContent>
			</Card>
		</div>
	);
}
