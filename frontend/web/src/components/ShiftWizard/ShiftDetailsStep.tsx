import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Location } from "../../api";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { Textarea } from "../ui/textarea";

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
	return (
		<div className="flex-1">
			<form
				onSubmit={shiftForm.handleSubmit(handleShiftDetailsSubmit)}
				className="space-y-4 h-full flex flex-col">
				<div className="flex-1 space-y-6">
					{/* Selected location display */}
					<Card>
						<CardHeader>
							<CardTitle>Selected Location</CardTitle>
						</CardHeader>
						<CardContent>
							{locationData && (
								<>
									<p className="font-medium">
										{getLocationById(locationData.locationId)?.name}
									</p>
									{getLocationById(locationData.locationId)?.address && (
										<p className="text-muted-foreground">
											{getLocationById(locationData.locationId)?.address}
											{getLocationById(locationData.locationId)?.city &&
												`, ${getLocationById(locationData.locationId)?.city}`}
											{getLocationById(locationData.locationId)?.state &&
												` ${getLocationById(locationData.locationId)?.state}`}
										</p>
									)}
								</>
							)}
						</CardContent>
					</Card>

					<div className="space-y-6">
						<div>
							<h3 className="font-medium">Shift Schedule</h3>
							<p className="text-muted-foreground">
								Set when this shift will occur
							</p>
						</div>

						{/* Date and Time Selection */}
						<Card>
							<CardContent className="space-y-4">
								{/* Date Selection */}
								<div className="space-y-2">
									<Label htmlFor="date">Date</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start">
												<CalendarIcon className="mr-2 h-4 w-4" />
												{shiftForm.watch("date") ? (
													format(new Date(shiftForm.watch("date")), "PPP")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
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
										<p className="text-destructive">
											{shiftForm.formState.errors.date.message}
										</p>
									)}
								</div>

								{/* Time Selection */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="startTime">Start Time</Label>
										<Input
											id="startTime"
											type="time"
											{...shiftForm.register("startTime", {
												required: "Start time is required",
											})}
										/>
										{shiftForm.formState.errors.startTime && (
											<p className="text-destructive">
												{shiftForm.formState.errors.startTime.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="endTime">End Time</Label>
										<Input
											id="endTime"
											type="time"
											{...shiftForm.register("endTime", {
												required: "End time is required",
											})}
										/>
										{shiftForm.formState.errors.endTime && (
											<p className="text-destructive">
												{shiftForm.formState.errors.endTime.message}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Notes field */}
						<Card>
							<CardContent className="space-y-2">
								<Label htmlFor="notes">Notes (Optional)</Label>
								<Textarea
									id="notes"
									placeholder="Any additional information about this shift..."
									{...shiftForm.register("notes")}
								/>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button type="submit">Next</Button>
				</div>
			</form>
		</div>
	);
}
