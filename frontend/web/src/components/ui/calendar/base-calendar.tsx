import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
	SelectSingleEventHandler,
	SelectMultipleEventHandler,
	SelectRangeEventHandler,
	DateRange,
} from "react-day-picker";

type CalendarMode = "single" | "multiple" | "range";

interface BaseCalendarProps {
	selected?: Date | Date[] | DateRange;
	onSelect?:
		| SelectSingleEventHandler
		| SelectMultipleEventHandler
		| SelectRangeEventHandler;
	disabled?: Date[];
	className?: string;
	mode?: CalendarMode;
	numberOfMonths?: number;
	showOutsideDays?: boolean;
	fromDate?: Date;
	toDate?: Date;
}

export function BaseCalendar({
	selected,
	onSelect,
	disabled,
	className,
	mode = "single",
	numberOfMonths = 1,
	showOutsideDays = false,
	fromDate,
	toDate,
}: BaseCalendarProps) {
	const calendarProps = {
		disabled,
		className: cn("rounded-md border", className),
		numberOfMonths,
		showOutsideDays,
		fromDate,
		toDate,
	};

	switch (mode) {
		case "single":
			return (
				<Calendar
					mode="single"
					selected={selected as Date}
					onSelect={onSelect as SelectSingleEventHandler}
					{...calendarProps}
				/>
			);
		case "multiple":
			return (
				<Calendar
					mode="multiple"
					selected={selected as Date[]}
					onSelect={onSelect as SelectMultipleEventHandler}
					{...calendarProps}
				/>
			);
		case "range":
			return (
				<Calendar
					mode="range"
					selected={selected as DateRange}
					onSelect={onSelect as SelectRangeEventHandler}
					{...calendarProps}
				/>
			);
		default:
			return null;
	}
}
