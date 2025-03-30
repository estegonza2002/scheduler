import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	className?: string;
	error?: string;
}

function convertTo12Hour(hour: number): { hour: number; period: "AM" | "PM" } {
	if (hour === 0) {
		return { hour: 12, period: "AM" };
	} else if (hour === 12) {
		return { hour: 12, period: "PM" };
	} else if (hour > 12) {
		return { hour: hour - 12, period: "PM" };
	} else {
		return { hour, period: "AM" };
	}
}

function convertTo24Hour(hour: number, period: "AM" | "PM"): number {
	if (period === "AM" && hour === 12) {
		return 0;
	} else if (period === "PM" && hour !== 12) {
		return hour + 12;
	} else {
		return hour;
	}
}

export function TimePicker({
	label,
	className,
	error,
	value,
	onChange,
	...props
}: TimePickerProps) {
	const [open, setOpen] = React.useState(false);

	// Track if the component is mounted to prevent updates during unmounting
	const isMounted = React.useRef(true);

	// Track if we're currently updating from the internal state
	const isInternalUpdate = React.useRef(false);

	// Parse the value (expected in format "HH:MM")
	const [hour, setHour] = React.useState<number>(() => {
		if (typeof value === "string" && value) {
			return parseInt(value.split(":")[0], 10);
		}
		return 9; // Default hour
	});

	const [minute, setMinute] = React.useState<number>(() => {
		if (typeof value === "string" && value) {
			return parseInt(value.split(":")[1], 10);
		}
		return 0; // Default minute
	});

	const [period, setPeriod] = React.useState<"AM" | "PM">(() => {
		if (typeof value === "string" && value) {
			const h = parseInt(value.split(":")[0], 10);
			return h >= 12 ? "PM" : "AM";
		}
		return "AM"; // Default period
	});

	// Cleanup on unmount
	React.useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	// Convert 24-hour to 12-hour format for display
	const hour12 = React.useMemo(() => {
		const { hour: h12 } = convertTo12Hour(hour);
		return h12;
	}, [hour]);

	// Update the hour/minute/period when the external input value changes
	React.useEffect(() => {
		// Skip if this is an internal update to prevent loops
		if (isInternalUpdate.current) {
			isInternalUpdate.current = false;
			return;
		}

		if (typeof value === "string" && value) {
			const [hourStr, minuteStr] = value.split(":");

			if (hourStr && minuteStr) {
				const hourNum = parseInt(hourStr, 10);
				const minuteNum = parseInt(minuteStr, 10);

				// Only update if values are different to avoid unnecessary rerenders
				if (hourNum !== hour) setHour(hourNum);
				if (minuteNum !== minute) setMinute(minuteNum);

				const { period: newPeriod } = convertTo12Hour(hourNum);
				if (newPeriod !== period) setPeriod(newPeriod);
			}
		}
	}, [value, hour, minute, period]);

	// Update input value when hour/minute/period changes
	React.useEffect(() => {
		if (!onChange || !isMounted.current) return;

		const h24 = convertTo24Hour(hour12, period);
		const newTimeValue = `${h24.toString().padStart(2, "0")}:${minute
			.toString()
			.padStart(2, "0")}`;

		// Skip if the value is already what we want to set
		if (typeof value === "string" && value === newTimeValue) return;

		// Mark that we're doing an internal update
		isInternalUpdate.current = true;

		// Create a synthetic event
		const event = {
			target: {
				value: newTimeValue,
			},
		} as React.ChangeEvent<HTMLInputElement>;

		onChange(event);
	}, [hour12, minute, period, onChange, value]);

	// Handle custom time input (from the Input component)
	const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;

		if (inputValue && /^([0-9]{1,2}):([0-9]{1,2})$/.test(inputValue)) {
			const [hourStr, minuteStr] = inputValue.split(":");

			const hourNum = parseInt(hourStr, 10);
			const minuteNum = parseInt(minuteStr, 10);

			if (hourNum >= 0 && hourNum <= 23 && minuteNum >= 0 && minuteNum <= 59) {
				setHour(hourNum);
				setMinute(minuteNum);
				setPeriod(hourNum >= 12 ? "PM" : "AM");
			}
		}

		// Pass through the original event
		if (onChange) {
			// Don't mark as internal update since this is a direct input
			onChange(e);
		}
	};

	// Handle hour change
	const handleHourChange = (newHour: number) => {
		if (newHour >= 1 && newHour <= 12) {
			setHour(convertTo24Hour(newHour, period));
		}
	};

	// Handle minute change
	const handleMinuteChange = (newMinute: number) => {
		if (newMinute >= 0 && newMinute <= 59) {
			setMinute(newMinute);
		}
	};

	// Handle period change
	const handlePeriodChange = (newPeriod: "AM" | "PM") => {
		setPeriod(newPeriod);
		setHour(convertTo24Hour(hour12, newPeriod));
	};

	// Generate hours options (1-12)
	const hours = Array.from({ length: 12 }, (_, i) => i + 1);

	// Generate minutes options (00-55, step 5)
	const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

	// Format display time
	const displayTime = React.useMemo(() => {
		if (typeof value !== "string" || !value) return "Pick a time";
		const [hourStr, minuteStr] = value.split(":");
		const hourNum = parseInt(hourStr, 10);
		const minuteNum = parseInt(minuteStr, 10);

		const { hour: h12, period: p } = convertTo12Hour(hourNum);
		return `${h12.toString().padStart(2, "0")}:${minuteNum
			.toString()
			.padStart(2, "0")} ${p}`;
	}, [value]);

	return (
		<div className={cn("space-y-2", className)}>
			{label && <Label>{label}</Label>}
			<div className="flex items-center space-x-2">
				<Popover
					open={open}
					onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							className={cn(
								"flex-1 justify-start text-left font-normal",
								!value && "text-muted-foreground",
								error && "border-destructive"
							)}>
							<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
							<span>{displayTime}</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[280px] p-3">
						<div className="flex justify-between items-center mb-4">
							<h4 className="font-medium">Select time</h4>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<div className="space-y-1">
								<Label>Hour</Label>
								<Select
									value={hour12.toString()}
									onValueChange={(value) =>
										handleHourChange(parseInt(value, 10))
									}>
									<SelectTrigger>
										<SelectValue placeholder="Hour" />
									</SelectTrigger>
									<SelectContent>
										{hours.map((h) => (
											<SelectItem
												key={h}
												value={h.toString()}>
												{h.toString().padStart(2, "0")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1">
								<Label>Minute</Label>
								<Select
									value={minute.toString()}
									onValueChange={(value) =>
										handleMinuteChange(parseInt(value, 10))
									}>
									<SelectTrigger>
										<SelectValue placeholder="Minute" />
									</SelectTrigger>
									<SelectContent>
										{minutes.map((m) => (
											<SelectItem
												key={m}
												value={m.toString()}>
												{m.toString().padStart(2, "0")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1">
								<Label>Period</Label>
								<Select
									value={period}
									onValueChange={(value) =>
										handlePeriodChange(value as "AM" | "PM")
									}>
									<SelectTrigger>
										<SelectValue placeholder="AM/PM" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="AM">AM</SelectItem>
										<SelectItem value="PM">PM</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="mt-4">
							<Label>Custom Time</Label>
							<div className="flex mt-1 items-center">
								<Input
									type="time"
									value={value as string}
									onChange={handleTimeInputChange}
									className="flex-1"
								/>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Or enter time directly in 24h format
							</p>
						</div>

						<Button
							type="button"
							variant="default"
							className="w-full mt-4"
							onClick={() => setOpen(false)}>
							Done
						</Button>
					</PopoverContent>
				</Popover>

				{/* Hidden input for form handling */}
				<input
					type="hidden"
					value={value as string}
					{...props}
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
