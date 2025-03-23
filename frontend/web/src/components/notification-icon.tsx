import React from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useNotifications } from "../lib/notification-context";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { cn } from "../lib/utils";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";

export function NotificationIcon() {
	const {
		notifications,
		unreadCount,
		loading,
		markAsRead,
		markAllAsRead,
		dismissNotification,
		dismissAllNotifications,
		refreshNotifications,
	} = useNotifications();

	const handleMarkAllAsRead = (e: React.MouseEvent) => {
		e.preventDefault();
		markAllAsRead();
	};

	const handleDismissAll = (e: React.MouseEvent) => {
		e.preventDefault();
		dismissAllNotifications();
	};

	const handleNotificationClick = (id: string, url?: string) => {
		markAsRead(id);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
							{unreadCount > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-0"
				align="end">
				<Card className="border-0">
					<CardHeader className="py-3 px-4">
						<div className="flex justify-between items-center">
							<CardTitle className="text-lg">Notifications</CardTitle>
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleMarkAllAsRead}
									disabled={
										loading ||
										notifications.length === 0 ||
										notifications.every((n) => n.isRead)
									}>
									Mark all read
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={refreshNotifications}
									disabled={loading}>
									Refresh
								</Button>
							</div>
						</div>
					</CardHeader>
					<Separator />
					<ScrollArea className="h-[300px]">
						<CardContent className="p-0">
							{loading ? (
								// Loading state
								Array.from({ length: 5 }).map((_, i) => (
									<div
										key={i}
										className="p-3 border-b border-border">
										<div className="flex items-start gap-2">
											<Skeleton className="h-8 w-8 rounded-full" />
											<div className="space-y-2 flex-1">
												<Skeleton className="h-4 w-3/4" />
												<Skeleton className="h-3 w-full" />
											</div>
										</div>
									</div>
								))
							) : notifications.length === 0 ? (
								// Empty state
								<div className="py-8 px-4 text-center">
									<p className="text-muted-foreground">No notifications</p>
								</div>
							) : (
								// Notification items
								notifications.map((notification) => (
									<Link
										key={notification.id}
										to={notification.actionUrl || ""}
										onClick={() =>
											handleNotificationClick(
												notification.id,
												notification.actionUrl
											)
										}
										className={cn(
											"block border-b border-border px-4 py-3 transition-colors hover:bg-muted/50",
											!notification.isRead && "bg-muted/30"
										)}>
										<div className="flex flex-col gap-1">
											<div className="flex justify-between">
												<span
													className={cn(
														"text-sm font-medium",
														!notification.isRead && "font-semibold"
													)}>
													{notification.title}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-5 w-5 -mr-2"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														dismissNotification(notification.id);
													}}>
													<span className="sr-only">Dismiss</span>
													<span className="text-xs">×</span>
												</Button>
											</div>
											<p className="text-xs text-muted-foreground">
												{notification.message}
											</p>
											<div className="flex justify-between items-center mt-1">
												<time
													dateTime={notification.createdAt}
													className="text-xs text-muted-foreground">
													{formatDistanceToNow(
														new Date(notification.createdAt),
														{
															addSuffix: true,
														}
													)}
												</time>
												{notification.isActionRequired && (
													<Badge
														variant="outline"
														className="text-xs py-0 h-5">
														Action required
													</Badge>
												)}
											</div>
										</div>
									</Link>
								))
							)}
						</CardContent>
					</ScrollArea>
					<CardFooter className="px-4 py-3 flex justify-between">
						<Button
							variant="outline"
							size="sm"
							onClick={handleDismissAll}
							disabled={loading || notifications.length === 0}>
							Clear all
						</Button>
						<Button
							size="sm"
							asChild>
							<Link to="/notifications">View all</Link>
						</Button>
					</CardFooter>
				</Card>
			</PopoverContent>
		</Popover>
	);
}
