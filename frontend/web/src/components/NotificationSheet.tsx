import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationsContext } from "@/lib/notification-context";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { getNotificationIcon } from "../utils/notifications";
import { NotificationItem } from "./NotificationItem";

export function NotificationSheet() {
	const {
		notifications,
		unreadCount,
		loading,
		markAsRead,
		markAllAsRead,
		dismissNotification,
		dismissAllNotifications,
	} = useNotificationsContext();

	const [open, setOpen] = useState(false);

	const handleMarkAllAsRead = () => {
		markAllAsRead();
	};

	const handleDismissAll = () => {
		dismissAllNotifications();
	};

	const handleNotificationClick = (id: string, url?: string) => {
		markAsRead(id);
		if (url) {
			setOpen(false);
		}
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative rounded-full">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-destructive rounded-full" />
					)}
				</Button>
			</SheetTrigger>
			<SheetContent className="sm:max-w-md p-0 flex flex-col h-[100dvh]">
				<div className="flex flex-col h-full">
					<div className="px-4 py-3 flex items-center justify-between border-b">
						<div className="flex items-center gap-2">
							<div className="bg-primary/10 p-1.5 rounded-full">
								<Bell className="h-5 w-5 text-primary" />
							</div>
							<SheetTitle className="text-lg">Notifications</SheetTitle>
						</div>
					</div>

					<div className="flex items-center justify-between px-4 py-2 border-b">
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="text-sm h-8 rounded-full"
								onClick={handleMarkAllAsRead}
								disabled={
									loading ||
									notifications.length === 0 ||
									notifications.every((n) => n.isRead)
								}>
								Mark all read
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="text-sm h-8 rounded-full"
								onClick={handleDismissAll}
								disabled={loading || notifications.length === 0}>
								Clear all
							</Button>
						</div>
						{unreadCount > 0 && (
							<Badge
								variant="secondary"
								className="px-2.5">
								{unreadCount} unread
							</Badge>
						)}
					</div>

					<ScrollArea className="flex-1">
						<div className="p-0">
							{loading ? (
								<div className="flex items-center justify-center p-6">
									<div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-primary"></div>
								</div>
							) : notifications.length === 0 ? (
								<div className="flex flex-col items-center justify-center p-8 text-center">
									<div className="bg-muted/30 p-3 rounded-full mb-3">
										<Bell className="h-7 w-7 text-muted-foreground" />
									</div>
									<h3 className="text-base font-medium">No notifications</h3>
									<p className="text-sm text-muted-foreground mt-1">
										You don't have any notifications yet
									</p>
								</div>
							) : (
								<div>
									{notifications.map((notification) => (
										<NotificationItem
											key={notification.id}
											notification={notification}
											onMarkAsRead={markAsRead}
											onDismiss={dismissNotification}
											compact={true}
										/>
									))}
								</div>
							)}
						</div>
					</ScrollArea>
				</div>
			</SheetContent>
		</Sheet>
	);
}
