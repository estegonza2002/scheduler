import { useNavigate, useParams, useLocation } from "react-router-dom";
import { User, Calendar, Building2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmployeeNavProps {
	className?: string;
	onTabChange?: (tabId: string) => void;
}

export function EmployeeNav({ className, onTabChange }: EmployeeNavProps) {
	const navigate = useNavigate();
	const { employeeId } = useParams<{ employeeId: string }>();
	const location = useLocation();
	const pathname = location.pathname;

	// Define the navigation items
	const navItems = [
		{
			label: "Overview",
			icon: <User className="h-4 w-4" />,
			path: `/employees/${employeeId}`,
			active:
				pathname === `/employees/${employeeId}` && !location.state?.activeTab,
			tabId: "overview",
		},
		{
			label: "Shifts",
			icon: <Calendar className="h-4 w-4" />,
			path: `/employees/${employeeId}`,
			active: location.state?.activeTab === "shifts",
			tabId: "shifts",
		},
		{
			label: "Locations",
			icon: <Building2 className="h-4 w-4" />,
			path: `/employees/${employeeId}`,
			active: location.state?.activeTab === "locations",
			tabId: "locations",
		},
		{
			label: "Earnings",
			icon: <DollarSign className="h-4 w-4" />,
			path: `/employees/${employeeId}`,
			active: location.state?.activeTab === "earnings",
			tabId: "earnings",
		},
	];

	const handleNavigation = (item: any) => {
		if (item.tabId && onTabChange) {
			// If on the detail page, use tab switching via callback
			onTabChange(item.tabId);
		} else {
			// For any other navigation with tab state
			navigate(item.path, {
				state: {
					activeTab: item.tabId !== "overview" ? item.tabId : null,
				},
			});
		}
	};

	return (
		<div className={cn("border-b w-full", className)}>
			<div className="flex justify-center overflow-auto scrollbar-none">
				<div className="flex">
					{navItems.map((item) => (
						<Button
							key={item.tabId}
							variant="ghost"
							size="sm"
							className={cn(
								"flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2",
								item.active && "border-primary font-medium text-foreground"
							)}
							onClick={() => handleNavigation(item)}>
							{item.icon}
							{item.label}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
