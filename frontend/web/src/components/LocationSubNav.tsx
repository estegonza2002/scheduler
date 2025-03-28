import { Link, useLocation } from "react-router-dom";
import { Building2, Users, Calendar, DollarSign, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSubNavProps {
	locationId: string;
	locationName?: string;
}

export function LocationSubNav({
	locationId,
	locationName,
}: LocationSubNavProps) {
	const location = useLocation();
	const currentPath = location.pathname;

	const navItems = [
		{
			name: "Overview",
			path: `/locations/${locationId}`,
			icon: Building2,
			exact: true,
		},
		{
			name: "Insights",
			path: `/locations/${locationId}/insights`,
			icon: BarChart,
		},
		{
			name: "Employees",
			path: `/locations/${locationId}/employees`,
			icon: Users,
		},
		{
			name: "Shifts",
			path: `/locations/${locationId}/shifts`,
			icon: Calendar,
		},
		{
			name: "Finance",
			path: `/locations/${locationId}/finance`,
			icon: DollarSign,
		},
	];

	return (
		<div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 w-full">
			<nav className="flex overflow-x-auto border-b">
				{navItems.map((item) => {
					const isActive = item.exact
						? currentPath === item.path
						: currentPath.startsWith(item.path);

					return (
						<Link
							key={item.path}
							to={item.path}
							className={cn(
								"flex items-center px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors whitespace-nowrap",
								isActive
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
							)}>
							<item.icon className="h-4 w-4 mr-2" />
							{item.name}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
