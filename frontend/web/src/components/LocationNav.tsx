import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Building2, BarChart, DollarSign, Calendar, Users } from "lucide-react";

interface LocationNavProps {
	className?: string;
}

export function LocationNav({ className }: LocationNavProps) {
	const navigate = useNavigate();
	const { locationId } = useParams<{ locationId: string }>();
	const location = useLocation();

	// Define the navigation items
	const navItems = [
		{
			label: "Overview",
			icon: <Building2 className="h-4 w-4" />,
			path: `/locations/${locationId}`,
			active: location.pathname === `/locations/${locationId}`,
		},
		{
			label: "Insights",
			icon: <BarChart className="h-4 w-4" />,
			path: `/locations/${locationId}/insights`,
			active: location.pathname === `/locations/${locationId}/insights`,
		},
		{
			label: "Finance",
			icon: <DollarSign className="h-4 w-4" />,
			path: `/locations/${locationId}/finance`,
			active: location.pathname === `/locations/${locationId}/finance`,
		},
		{
			label: "Shifts",
			icon: <Calendar className="h-4 w-4" />,
			path: `/locations/${locationId}/shifts`,
			active: location.pathname === `/locations/${locationId}/shifts`,
		},
		{
			label: "Employees",
			icon: <Users className="h-4 w-4" />,
			path: `/locations/${locationId}/employees`,
			active: location.pathname === `/locations/${locationId}/employees`,
		},
	];

	return (
		<div className={cn("mb-6 border-b", className)}>
			<div className="flex overflow-auto scrollbar-none">
				{navItems.map((item) => (
					<Button
						key={item.path}
						variant="ghost"
						size="sm"
						className={cn(
							"flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2",
							item.active && "border-primary font-medium text-foreground"
						)}
						onClick={() => navigate(item.path)}>
						{item.icon}
						{item.label}
					</Button>
				))}
			</div>
		</div>
	);
}
