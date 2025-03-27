import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { DayPickerSingleProps } from "react-day-picker";

export interface DatePickerProps {
	value?: Date;
	onChange?: (date: Date | undefined) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
	calendarProps?: Partial<DayPickerSingleProps>;
}

export function DatePicker({
	value,
	onChange,
	disabled,
	placeholder = "Pick a date",
	className,
	calendarProps,
}: DatePickerProps) {
	return (
		<div className={className}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal",
							!value && "text-muted-foreground"
						)}
						disabled={disabled}>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{value ? format(value, "PPP") : placeholder}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
						mode="single"
						selected={value}
						onSelect={onChange}
						initialFocus
						{...calendarProps}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
