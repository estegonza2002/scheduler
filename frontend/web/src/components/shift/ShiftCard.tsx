import { format } from "date-fns";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Shift, Location, Employee } from "../../api";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";

// Helper functions
const formatTime = (date: Date): string => {
	return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

interface ShiftCardProps {
	shift: Shift;
	locations: Location[];
	employees: Employee[];
}

export function ShiftCard({ shift, locations, employees }: ShiftCardProps) {
	const navigate = useNavigate();

	// Helper functions
	const getLocationName = (locationId: string | null | undefined): string => {
		if (!locationId) return "Unassigned";
		const location = locations.find((loc) => loc.id === locationId);
		if (!location) {
			console.warn(
				`Location not found with ID: ${locationId}. Available location IDs:`,
				locations.map((loc) => loc.id)
			);
			return "Unassigned";
		}
		return location.name;
	};

	// Count assigned employees (in a real app, this would likely be a property of the shift)
	const getAssignedEmployeesCount = (): number => {
		// For now just checking if there's a primary employee assigned
		// In a real app, you'd likely count all assignments
		return shift.user_id ? 1 : 0;
	};

	return (
		<Card
			className="hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
			onClick={() => navigate(`/shifts/${shift.id}`)}>
			<CardContent className="p-3">
				<div className="flex justify-between items-center">
					<div>
						<h3 className="font-medium text-sm group-hover:text-primary">
							{formatTime(new Date(shift.start_time))} -{" "}
							{formatTime(new Date(shift.end_time))}
						</h3>
						<p className="text-xs text-muted-foreground">
							{getLocationName(shift.location_id)}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center text-xs text-muted-foreground">
							<Users className="h-3 w-3 mr-1" />
							<span>{getAssignedEmployeesCount()}</span>
						</div>
						<ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
