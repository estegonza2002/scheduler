import { Search } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarInput,
} from "@/components/ui/sidebar";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
	return (
		<form {...props}>
			<SidebarGroup>
				<SidebarGroupContent>
					<Label
						htmlFor="search"
						className="sr-only">
						Search
					</Label>
					<div className="relative">
						<SidebarInput
							id="search"
							placeholder="Search the docs..."
						/>
						<Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					</div>
				</SidebarGroupContent>
			</SidebarGroup>
		</form>
	);
}
