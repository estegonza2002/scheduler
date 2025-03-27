import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export function DatePicker() {
	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<Calendar />
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
