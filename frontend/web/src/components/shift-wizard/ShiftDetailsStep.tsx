import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Location } from "../../api";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, MapPin, X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { useMemo } from "react";

type ShiftData = {
	date: string;
	startTime: string;
	endTime: string;
	notes?: string;
};

type LocationData = {
	locationId: string;
};

interface ShiftDetailsStepProps {
	shiftForm: UseFormReturn<ShiftData>;
	locationData: LocationData;
	getLocationById: (locationId: string) => Location | undefined;
	handleShiftDetailsSubmit: (data: ShiftData) => void;
	onBack: () => void;
}

// Helper function to format time string from 24h to 12h format
function formatTime(timeString: string): string {
	if (!timeString) return "";

	const [hours, minutes] = timeString.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

	return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function ShiftDetailsStep({
	shiftForm,
	locationData,
	getLocationById,
	handleShiftDetailsSubmit,
	onBack,
}: ShiftDetailsStepProps) {
	const location = getLocationById(locationData.locationId);
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isValid },
	} = shiftForm;

	// Extract data from form
	const date = watch("date");
	const startTime = watch("startTime");
	const endTime = watch("endTime");

	// Format date and time for display
	const formattedDate = date
		? format(new Date(date), "EEEE, MMMM d, yyyy")
		: null;

	// Calculate shift duration in hours
	const shiftDuration = useMemo(() => {
		if (!startTime || !endTime) return null;

		const [startHours, startMinutes] = startTime.split(":").map(Number);
		const [endHours, endMinutes] = endTime.split(":").map(Number);

		let durationInMinutes =
			endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

		// If duration is negative, assume shift spans midnight
		if (durationInMinutes < 0) {
			durationInMinutes += 24 * 60;
		}

		const hours = Math.floor(durationInMinutes / 60);
		const minutes = durationInMinutes % 60;

		return {
			hours,
			minutes,
			totalMinutes: durationInMinutes,
			displayText:
				hours > 0
					? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`
					: `${minutes}m`,
		};
	}, [startTime, endTime]);

	return (
		<div className="p-6 flex flex-col">
			<div className="mb-6">
				<Badge
					variant="outline"
					className="mb-2">
					Location
				</Badge>
				<h3 className="text-lg font-medium">{location?.name}</h3>
				{location?.address && (
					<p className="text-sm text-muted-foreground">{location.address}</p>
				)}
			</div>

			<form
				id="shift-details-form"
				className="space-y-4"
				onSubmit={handleSubmit(handleShiftDetailsSubmit)}>
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								type="date"
								{...register("date", { required: "Date is required" })}
							/>
							{errors.date && (
								<p className="text-sm text-destructive">
									{errors.date.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="startTime">Start Time</Label>
								<Input
									id="startTime"
									type="time"
									{...register("startTime", {
										required: "Start time is required",
									})}
								/>
								{errors.startTime && (
									<p className="text-sm text-destructive">
										{errors.startTime.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="endTime">End Time</Label>
								<Input
									id="endTime"
									type="time"
									{...register("endTime", {
										required: "End time is required",
									})}
								/>
								{errors.endTime && (
									<p className="text-sm text-destructive">
										{errors.endTime.message}
									</p>
								)}
							</div>
						</div>

						{isValid && date && startTime && endTime && (
							<div className="bg-muted/50 p-3 rounded-md">
								<div className="flex justify-between text-sm">
									<span>
										{formattedDate} • {formatTime(startTime)} to{" "}
										{formatTime(endTime)}
									</span>
									{shiftDuration && (
										<Badge variant="secondary">
											{shiftDuration.displayText}
										</Badge>
									)}
								</div>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								placeholder="Add any specific details about this shift"
								className="min-h-[100px]"
								{...register("notes")}
							/>
						</div>
					</div>
				</div>

				{/* Hidden submit button for form validity */}
				<button
					type="submit"
					className="hidden"
				/>
			</form>

			{/* Navigation Buttons */}
			<div className="flex justify-between border-t pt-4 mt-4">
				<Button
					variant="outline"
					onClick={onBack}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<Button
					onClick={handleSubmit(handleShiftDetailsSubmit)}
					disabled={!isValid}>
					Continue
				</Button>
			</div>
		</div>
	);
}
