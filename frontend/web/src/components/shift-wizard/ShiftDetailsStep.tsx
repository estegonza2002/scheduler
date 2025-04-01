import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Label } from "../ui/label";
import { Location } from "../../api";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format, addDays, parseISO } from "date-fns";
import { CalendarIcon, ArrowLeft, MapPin, Building2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { useMemo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TimePicker } from "../ui/time-picker";

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

	// Keep a state of the selectedDate to maintain consistency
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

	// Set default date to tomorrow when the component renders
	useEffect(() => {
		// Only run this once on mount
		if (!selectedDate) {
			const tomorrow = addDays(new Date(), 1);
			const dateStr = format(tomorrow, "yyyy-MM-dd");
			setSelectedDate(tomorrow);
			setValue("date", dateStr, { shouldValidate: true });
		}
	}, [setValue, selectedDate]);

	// Set default start and end times if not already set
	useEffect(() => {
		if (!watch("startTime")) {
			setValue("startTime", "09:00", { shouldValidate: true });
		}

		if (!watch("endTime")) {
			setValue("endTime", "17:00", { shouldValidate: true });
		}
	}, [setValue, watch]);

	// Extract data from form
	const date = watch("date");
	const startTime = watch("startTime");
	const endTime = watch("endTime");

	// Format date and time for display
	const formattedDate = date
		? format(parseISO(date), "EEEE, MMMM d, yyyy")
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

	// Handle date change from the DatePicker component
	const handleDateChange = (newDate: Date | undefined) => {
		if (newDate) {
			// Store the selected date in state
			setSelectedDate(newDate);

			// Just use date portion for form value
			const dateStr = format(newDate, "yyyy-MM-dd");
			setValue("date", dateStr, { shouldValidate: true });
		}
	};

	// Handle time change with validation
	const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
		setValue(field, value, { shouldValidate: true });

		// Validate time inputs after both are set
		if (startTime && endTime) {
			validateTimes();
		}
	};

	// Validate that end time is after start time
	const validateTimes = () => {
		if (!startTime || !endTime) return;

		const [startHours, startMinutes] = startTime.split(":").map(Number);
		const [endHours, endMinutes] = endTime.split(":").map(Number);

		const startTotalMinutes = startHours * 60 + startMinutes;
		const endTotalMinutes = endHours * 60 + endMinutes;

		// If end time is earlier than start time, assume shift spans midnight
		// so we don't need to show an error
	};

	// Get full address as a formatted string
	const getFullAddress = (location?: Location) => {
		if (!location) return "";

		const parts = [];
		if (location.address) parts.push(location.address);
		if (location.city) parts.push(location.city);
		if (location.state) {
			if (location.zipCode) {
				parts.push(`${location.state} ${location.zipCode}`);
			} else {
				parts.push(location.state);
			}
		} else if (location.zipCode) {
			parts.push(location.zipCode);
		}
		return parts.join(", ");
	};

	return (
		<Card className="p-6">
			{location && (
				<CardHeader className="p-0 pb-6">
					<Card className="bg-accent/30">
						<CardContent className="p-4">
							<div className="flex items-center mb-2">
								<Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
								<h3 className="text-lg font-medium">{location.name}</h3>
							</div>
							{getFullAddress(location) && (
								<div className="flex items-start text-sm text-muted-foreground">
									<MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
									<span>{getFullAddress(location)}</span>
								</div>
							)}
						</CardContent>
					</Card>
				</CardHeader>
			)}

			<CardContent className="p-0">
				<form
					id="shift-details-form"
					className="space-y-4"
					onSubmit={handleSubmit(handleShiftDetailsSubmit)}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"w-full justify-start text-left font-normal",
											!date && "text-muted-foreground"
										)}>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{date ? format(parseISO(date), "PPP") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={selectedDate}
										onSelect={handleDateChange}
										initialFocus
										disabled={(date) =>
											date < new Date(new Date().setHours(0, 0, 0, 0))
										}
										className="rounded-md border"
									/>
								</PopoverContent>
							</Popover>
							{errors.date && (
								<p className="text-sm text-destructive">
									{errors.date.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<TimePicker
								label="Start Time"
								value={startTime}
								onChange={(e) => handleTimeChange("startTime", e.target.value)}
								error={errors.startTime?.message}
								id="startTime"
								name="startTime"
							/>
							<TimePicker
								label="End Time"
								value={endTime}
								onChange={(e) => handleTimeChange("endTime", e.target.value)}
								error={errors.endTime?.message}
								id="endTime"
								name="endTime"
							/>
						</div>

						{isValid && date && startTime && endTime && (
							<Card className="bg-muted/50">
								<CardContent className="py-3 flex justify-between text-sm">
									<span>
										{formattedDate} • {formatTime(startTime)} to{" "}
										{formatTime(endTime)}
									</span>
									{shiftDuration && (
										<Badge variant="secondary">
											{shiftDuration.displayText}
										</Badge>
									)}
								</CardContent>
							</Card>
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

					<button
						type="submit"
						className="hidden"
					/>
				</form>
			</CardContent>

			<CardFooter className="px-0 pt-4 mt-4 border-t flex justify-between">
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
			</CardFooter>
		</Card>
	);
}
