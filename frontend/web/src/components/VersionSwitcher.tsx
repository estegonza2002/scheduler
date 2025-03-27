import * as React from "react";
import { Check, ChevronsUpDown, FileText, Book } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VersionSwitcherProps {
	/**
	 * Array of available version strings
	 */
	versions: string[];
	/**
	 * The default version to show
	 */
	defaultVersion: string;
	/**
	 * Optional callback when version changes
	 */
	onVersionChange?: (version: string) => void;
	/**
	 * Optional label text
	 * @default "Documentation"
	 */
	label?: string;
	/**
	 * Optional className for the sidebar menu button
	 */
	className?: string;
}

/**
 * VersionSwitcher component for switching between documentation versions
 */
export function VersionSwitcher({
	versions,
	defaultVersion,
	onVersionChange,
	label = "Documentation",
	className,
}: VersionSwitcherProps) {
	const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion);

	const handleVersionChange = (version: string) => {
		setSelectedVersion(version);
		if (onVersionChange) {
			onVersionChange(version);
		}
	};

	// Check if the selected version is the latest
	const isLatest = selectedVersion === versions[versions.length - 1];

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className={cn(
											"transition-colors duration-200",
											"data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
											className
										)}>
										<div className="flex aspect-square h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary-foreground">
											<Book className="h-5 w-5" />
										</div>
										<div className="flex flex-col gap-0.5 leading-none">
											<span className="font-semibold">{label}</span>
											<div className="flex items-center gap-2">
												<span className="">v{selectedVersion}</span>
												{isLatest && (
													<Badge
														variant="outline"
														className="rounded-sm px-1 py-0 text-[10px] font-medium">
														LATEST
													</Badge>
												)}
											</div>
										</div>
										<ChevronsUpDown className="ml-auto h-4 w-4 opacity-70" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-[--radix-dropdown-menu-trigger-width] min-w-[180px]"
									align="start">
									<DropdownMenuLabel>Select Version</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{versions.map((version, index) => (
										<DropdownMenuItem
											key={version}
											onSelect={() => handleVersionChange(version)}
											className="flex cursor-pointer items-center justify-between">
											<div className="flex items-center gap-2">
												<FileText className="h-4 w-4 opacity-70" />
												<span>v{version}</span>
											</div>
											{version === selectedVersion && (
												<Check className="h-4 w-4 text-primary" />
											)}
											{index === versions.length - 1 && (
												<Badge
													variant="outline"
													className="ml-2 rounded-sm px-1 py-0 text-[10px] font-medium">
													LATEST
												</Badge>
											)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Switch documentation version</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
