import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useOrganization } from "@/lib/organization-context";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function OrganizationSwitcher() {
	const [open, setOpen] = React.useState(false);
	const navigate = useNavigate();
	const { currentOrganization, organizations, switchOrganization } =
		useOrganization();

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-label="Select organization"
					className="w-[200px] justify-between">
					<div className="flex items-center gap-2">
						{currentOrganization && (
							<Avatar className="h-5 w-5">
								<AvatarImage
									src={`https://avatar.vercel.sh/${currentOrganization.name}.png`}
									alt={currentOrganization.name}
								/>
								<AvatarFallback>
									{currentOrganization.name.substring(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						)}
						<span className="truncate">
							{currentOrganization?.name || "Select organization"}
						</span>
					</div>
					<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Search organization..." />
					<CommandList>
						<CommandEmpty>No organization found.</CommandEmpty>
						<CommandGroup heading="Organizations">
							{organizations.map((org) => (
								<CommandItem
									key={org.id}
									onSelect={async () => {
										await switchOrganization(org.id);
										setOpen(false);
									}}
									className="text-sm">
									<div className="flex items-center gap-2 flex-1 min-w-0">
										<Avatar className="h-5 w-5">
											<AvatarImage
												src={`https://avatar.vercel.sh/${org.name}.png`}
												alt={org.name}
											/>
											<AvatarFallback>
												{org.name.substring(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span className="truncate flex-1">{org.name}</span>
										<Badge
											variant="outline"
											className="ml-auto">
											{org.role || "member"}
										</Badge>
										<Check
											className={cn(
												"h-4 w-4",
												currentOrganization?.id === org.id
													? "opacity-100"
													: "opacity-0"
											)}
										/>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								onSelect={() => {
									setOpen(false);
									navigate("/create-organization");
								}}>
								<PlusCircle className="mr-2 h-4 w-4" />
								Create Organization
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
