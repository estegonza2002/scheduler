import { Shift } from "../../api";
import { Badge } from "../ui/badge";
import {
	ClipboardCheck,
	Clock,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShiftStatusProps {
	shift: Shift;
}

export function ShiftStatus({ shift }: ShiftStatusProps) {
	const getShiftStatus = () => {
		const now = new Date();
		const startTime = new Date(shift.start_time);
		const endTime = new Date(shift.end_time);

		if (now < startTime) {
			return {
				status: "upcoming",
				label: "Upcoming",
				icon: <Clock className="h-3 w-3 mr-1" />,
				className: "bg-blue-100 text-blue-800 border-0",
			};
		} else if (now >= startTime && now <= endTime) {
			return {
				status: "active",
				label: "In Progress",
				icon: <AlertTriangle className="h-3 w-3 mr-1" />,
				className: "bg-orange-100 text-orange-800 border-0",
			};
		} else {
			return {
				status: "completed",
				label: "Completed",
				icon: <CheckCircle className="h-3 w-3 mr-1" />,
				className: "bg-green-100 text-green-800 border-0",
			};
		}
	};

	const { label, icon, className } = getShiftStatus();

	return (
		<Badge className={cn("flex items-center font-medium", className)}>
			{icon}
			{label}
		</Badge>
	);
}
