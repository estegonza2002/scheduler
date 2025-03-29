import {
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
	User,
	Building2,
	Tags,
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
import { Link, useNavigate } from "react-router-dom";
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
	const navigate = useNavigate();
	const isPaidUser = subscriptionPlan !== "free";

	// Debug log for avatar URL
	console.log("NavUser avatar_url:", user.avatar_url);

	const handleSignOut = () => {
		signOut();
	};

	const handleProfileClick = () => {
		navigate("/profile");
	};

	return (
		<SidebarMenu className="px-2 pt-2 pb-1">
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="w-full rounded-md"
					onClick={handleProfileClick}>
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
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
