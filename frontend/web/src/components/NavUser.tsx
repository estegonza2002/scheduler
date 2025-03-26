import {
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
	User,
	Building2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "./ui/sidebar";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function NavUser({
	user,
	isAdmin = false,
	subscriptionPlan = "free",
	isOnline = true,
}: {
	user: {
		name: string;
		email: string;
		avatar_url: string;
	};
	isAdmin?: boolean;
	subscriptionPlan?: "free" | "pro" | "business";
	isOnline?: boolean;
}) {
	const { isMobile } = useSidebar();
	const { signOut } = useAuth();
	const isPaidUser = subscriptionPlan !== "free";

	// Debug log for avatar URL
	console.log("NavUser avatar_url:", user.avatar_url);

	const handleSignOut = () => {
		signOut();
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							<div className="relative">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={user.avatar_url}
										alt={user.name}
										onError={(e) => {
											console.error("Error loading avatar image:", e);
											console.log("Failed avatar URL:", user.avatar_url);
										}}
									/>
									<AvatarFallback className="rounded-lg">
										{user.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<span
									className={`absolute top-0 right-0 translate-x-1 -translate-y-1 block h-3 w-3 rounded-full border-2 border-background ${
										isOnline ? "bg-green-500" : "bg-gray-400"
									}`}></span>
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="start"
						sideOffset={4}>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<div className="relative">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={user.avatar_url}
											alt={user.name}
											onError={(e) => {
												console.error(
													"Error loading dropdown avatar image:",
													e
												);
												console.log(
													"Failed dropdown avatar URL:",
													user.avatar_url
												);
											}}
										/>
										<AvatarFallback className="rounded-lg">
											{user.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<span
										className={`absolute top-0 right-0 translate-x-1 -translate-y-1 block h-3 w-3 rounded-full border-2 border-background ${
											isOnline ? "bg-green-500" : "bg-gray-400"
										}`}></span>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link to="/profile">
									<User className="mr-2 h-4 w-4" />
									Profile
								</Link>
							</DropdownMenuItem>
							{isAdmin && (
								<DropdownMenuItem asChild>
									<Link to="/business-profile">
										<Building2 className="mr-2 h-4 w-4" />
										Business Profile
									</Link>
								</DropdownMenuItem>
							)}
							{!isPaidUser ? (
								<DropdownMenuItem asChild>
									<Link to="/billing">
										<Sparkles className="mr-2 h-4 w-4" />
										Upgrade to Pro
									</Link>
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem asChild>
									<Link to="/billing">
										<CreditCard className="mr-2 h-4 w-4" />
										Billing
									</Link>
								</DropdownMenuItem>
							)}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut}>
							<LogOut className="mr-2 h-4 w-4" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
