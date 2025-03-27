import * as React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
	value?: DateRange;
	onChange?: (value: DateRange | undefined) => void;
	className?: string;
	placeholder?: string;
}

export function DateRangePicker({
	value,
	onChange,
	className,
	placeholder = "Select date range",
}: DateRangePickerProps) {
	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date-range"
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal",
							!value?.from && "text-muted-foreground"
						)}>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{value?.from ? (
							value.to ? (
								<span>
									{format(value.from, "LLL d, y")} -{" "}
									{format(value.to, "LLL d, y")}
								</span>
							) : (
								format(value.from, "LLL d, y")
							)
						) : (
							placeholder
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0"
					align="start">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={value?.from}
						selected={value}
						onSelect={onChange}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
