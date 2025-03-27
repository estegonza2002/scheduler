import {
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
	User,
	Building2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

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
						<SidebarMenuButton size="lg">
							<AvatarWithStatus
								isOnline={isOnline}
								fallback={user.name.charAt(0)}
								src={user.avatar_url}
								alt={user.name}
								className="mr-2"
							/>
							<span className="flex-1 overflow-hidden text-left">
								<span className="block truncate font-medium">{user.name}</span>
								<span className="block truncate text-xs text-muted-foreground">
									{user.email}
								</span>
							</span>
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side={isMobile ? "bottom" : "right"}
						align="start"
						sideOffset={4}>
						<DropdownMenuLabel>
							<div className="flex items-center gap-2">
								<AvatarWithStatus
									isOnline={isOnline}
									fallback={user.name.charAt(0)}
									src={user.avatar_url}
									alt={user.name}
								/>
								<span>
									<span className="block font-medium">{user.name}</span>
									<span className="block text-xs text-muted-foreground">
										{user.email}
									</span>
								</span>
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
