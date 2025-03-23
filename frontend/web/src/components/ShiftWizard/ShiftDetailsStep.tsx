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

export function ShiftDetailsStep({
	shiftForm,
	locationData,
	getLocationById,
	handleShiftDetailsSubmit,
	onBack,
}: ShiftDetailsStepProps) {
	const location = locationData
		? getLocationById(locationData.locationId)
		: null;

	return (
		<div className="flex flex-col h-full relative">
			<form
				id="shift-details-form"
				onSubmit={shiftForm.handleSubmit(handleShiftDetailsSubmit)}
				className="flex flex-col h-full">
				{/* Content area with padding at bottom for fixed footer */}
				<div className="flex-1 overflow-auto px-6 py-4 pb-24">
					{/* Location badge at the top */}
					{location && (
						<div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border">
							<div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
								<MapPin className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-medium truncate">{location.name}</h3>
								{location.address && (
									<p className="text-sm text-muted-foreground truncate">
										{location.address}
										{location.city && `, ${location.city}`}
										{location.state && ` ${location.state}`}
									</p>
								)}
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={onBack}
								title="Change location"
								className="h-8 w-8 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
								<X className="h-4 w-4" />
								<span className="sr-only">Change location</span>
							</Button>
						</div>
					)}

					{/* Shift date and times */}
					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-medium">Shift Details</h3>
							<p className="text-muted-foreground">
								Set the date and times for this shift
							</p>
						</div>

						{/* Date picker */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="date">Date</Label>
								<div>
									<input
										type="hidden"
										{...shiftForm.register("date")}
									/>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left">
												{shiftForm.watch("date") ? (
													format(
														new Date(shiftForm.watch("date")),
														"EEE, MMMM d, yyyy"
													)
												) : (
													<span>Pick a date</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start">
											<Calendar
												mode="single"
												selected={
													shiftForm.watch("date")
														? new Date(shiftForm.watch("date"))
														: undefined
												}
												onSelect={(date) => {
													if (date) {
														shiftForm.setValue(
															"date",
															format(date, "yyyy-MM-dd")
														);
													}
												}}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									{shiftForm.formState.errors.date && (
										<p className="text-sm font-medium text-destructive mt-2">
											{shiftForm.formState.errors.date.message}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Time inputs */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="startTime">Start Time</Label>
								<Input
									id="startTime"
									type="time"
									{...shiftForm.register("startTime")}
								/>
								{shiftForm.formState.errors.startTime && (
									<p className="text-sm font-medium text-destructive mt-2">
										{shiftForm.formState.errors.startTime.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="endTime">End Time</Label>
								<Input
									id="endTime"
									type="time"
									{...shiftForm.register("endTime")}
								/>
								{shiftForm.formState.errors.endTime && (
									<p className="text-sm font-medium text-destructive mt-2">
										{shiftForm.formState.errors.endTime.message}
									</p>
								)}
							</div>
						</div>

						{/* Notes */}
						<div className="space-y-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								placeholder="Add any additional information about this shift"
								className="min-h-[100px]"
								{...shiftForm.register("notes")}
							/>
						</div>
					</div>
				</div>
			</form>

			{/* Absolutely positioned footer with buttons */}
			<div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 border-t bg-background">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<Button
					type="submit"
					form="shift-details-form"
					disabled={!shiftForm.formState.isValid}>
					Continue
				</Button>
			</div>
		</div>
	);
}
