import { Shift } from "../../api";
import { Badge } from "../ui/badge";
import {
	ClipboardCheck,
	Clock,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";

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
				color: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
			};
		} else if (now >= startTime && now <= endTime) {
			return {
				status: "active",
				label: "In Progress",
				icon: <AlertTriangle className="h-3 w-3 mr-1" />,
				color: "bg-orange-100 text-orange-800 hover:bg-orange-100/80",
			};
		} else {
			return {
				status: "completed",
				label: "Completed",
				icon: <CheckCircle className="h-3 w-3 mr-1" />,
				color: "bg-green-100 text-green-800 hover:bg-green-100/80",
			};
		}
	};

	const { label, icon, color } = getShiftStatus();

	return (
		<Badge
			variant="outline"
			className={`${color} flex items-center font-medium border-0 transition-colors`}>
			{icon}
			{label}
		</Badge>
	);
}
