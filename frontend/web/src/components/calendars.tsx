import * as React from "react";
import { Check, ChevronRight } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { FragmentFix } from "@/components/ui/fragment-fix";

export function Calendars({
	calendars,
}: {
	calendars: {
		name: string;
		items: string[];
	}[];
}) {
	return (
		<>
			{calendars.map((calendar, index) => (
				<FragmentFix key={calendar.name}>
					<SidebarGroup>
						<Collapsible defaultOpen={index === 0}>
							<SidebarGroupLabel asChild>
								<CollapsibleTrigger>
									{calendar.name}{" "}
									<ChevronRight className="ml-auto transition-transform group-data-[state=open]:rotate-90" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{calendar.items.map((item, index) => (
											<SidebarMenuItem key={item}>
												<SidebarMenuButton>
													<div
														data-active={index < 2}
														className="size-4 rounded-sm border mr-2">
														<Check className="size-3" />
													</div>
													{item}
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</Collapsible>
					</SidebarGroup>
					<SidebarSeparator />
				</FragmentFix>
			))}
		</>
	);
}
