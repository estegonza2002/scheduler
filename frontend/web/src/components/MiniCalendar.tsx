import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { cn } from "../lib/utils";

interface MiniCalendarProps {
	className?: string;
}

export function MiniCalendar({ className }: MiniCalendarProps) {
	const [date, setDate] = useState<Date>(new Date());
	const navigate = useNavigate();

	const handleSelect = (newDate: Date | undefined) => {
		if (newDate) {
			setDate(newDate);
			navigate(`/daily-shifts?date=${format(newDate, "yyyy-MM-dd")}`);
		}
	};

	return (
		<Calendar
			mode="single"
			selected={date}
			onSelect={handleSelect}
			className={cn("border-0 w-full", className)}
			showOutsideDays
			initialFocus
		/>
	);
}
