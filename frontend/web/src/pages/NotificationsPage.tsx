import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNotifications } from "../lib/notification-context";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { Bell, Check, Search, Trash2, RefreshCw, Settings } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Notification } from "../api";
import { Link } from "react-router-dom";
import { ScrollArea } from "../components/ui/scroll-area";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { getNotificationIcon } from "../utils/notifications";

export default function NotificationsPage() {
	const {
		notifications,
		loading,
		markAsRead,
		markAllAsRead,
		dismissNotification,
		dismissAllNotifications,
		refreshNotifications,
	} = useNotifications();

	const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

	// Filter notifications based on current filters
	const filteredNotifications = notifications
		.filter((notification) => {
			// Apply read/unread filter
			if (filter === "unread" && notification.isRead) return false;
			if (filter === "read" && !notification.isRead) return false;

			// Apply type filter
			if (typeFilter !== "all" && notification.type !== typeFilter)
				return false;

			// Apply search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					notification.title.toLowerCase().includes(query) ||
					notification.message.toLowerCase().includes(query)
				);
			}

			return true;
		})
		.sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return sortBy === "newest" ? dateB - dateA : dateA - dateB;
		});

	// Group notifications by date
	const groupedNotifications: { [key: string]: Notification[] } = {};

	filteredNotifications.forEach((notification) => {
		const date = new Date(notification.createdAt);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		let dateStr: string;

		if (date.toDateString() === today.toDateString()) {
			dateStr = "Today";
		} else if (date.toDateString() === yesterday.toDateString()) {
			dateStr = "Yesterday";
		} else {
			dateStr = format(date, "MMM d, yyyy");
		}

		if (!groupedNotifications[dateStr]) {
			groupedNotifications[dateStr] = [];
		}

		groupedNotifications[dateStr].push(notification);
	});

	const handleMarkAsRead = (id: string) => {
		markAsRead(id);
	};

	const handleDismiss = (id: string) => {
		dismissNotification(id);
	};

	const handleMarkAllAsRead = () => {
		markAllAsRead();
	};

	const handleClearAll = () => {
		dismissAllNotifications();
	};

	return (
		<>
			<Helmet>
				<title>Notifications | Scheduler</title>
			</Helmet>

			<div className="px-4 sm:px-6 lg:px-8 py-6">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-semibold">Notifications</h1>
				</div>

				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search notifications..."
							className="pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div className="flex gap-2">
						<Select
							value={filter}
							onValueChange={(value) => setFilter(value as any)}>
							<SelectTrigger className="w-[130px]">
								<SelectValue placeholder="Filter" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="unread">Unread</SelectItem>
								<SelectItem value="read">Read</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={typeFilter}
							onValueChange={setTypeFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All types</SelectItem>
								<SelectItem value="shift_update">Shift Updates</SelectItem>
								<SelectItem value="shift_reminder">Reminders</SelectItem>
								<SelectItem value="request_update">Request Updates</SelectItem>
								<SelectItem value="system">System</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={sortBy}
							onValueChange={(value) => setSortBy(value as any)}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="newest">Newest first</SelectItem>
								<SelectItem value="oldest">Oldest first</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="flex justify-between items-center mb-4">
					<p className="text-sm text-muted-foreground">
						{filteredNotifications.length === 0
							? "No notifications found"
							: `Showing ${filteredNotifications.length} notification${
									filteredNotifications.length !== 1 ? "s" : ""
							  }`}
					</p>

					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={refreshNotifications}
							disabled={loading}
							className="flex items-center gap-1">
							<RefreshCw className="h-3 w-3 mr-1" />
							Refresh
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleMarkAllAsRead}
							disabled={loading || notifications.every((n) => n.isRead)}>
							Mark all as read
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleClearAll}
							disabled={loading || notifications.length === 0}>
							Clear all
						</Button>
					</div>
				</div>

				<div className="bg-background border rounded-lg">
					{loading ? (
						<div className="flex items-center justify-center p-6">
							<div className="animate-spin rounded-full h-6 w-6 border-2 border-b-transparent border-primary"></div>
						</div>
					) : filteredNotifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-8 text-center">
							<Bell className="h-10 w-10 text-muted-foreground mb-2" />
							<h3 className="text-lg font-medium">No notifications found</h3>
							<p className="text-sm text-muted-foreground mt-1">
								{notifications.length > 0
									? "Try changing your filters to see more notifications"
									: "You don't have any notifications yet"}
							</p>
						</div>
					) : (
						<ScrollArea className="h-[calc(100vh-200px)]">
							<div className="divide-y divide-border">
								{Object.entries(groupedNotifications).map(
									([date, notifications]) => (
										<div key={date}>
											<div className="sticky top-0 bg-background/95 backdrop-blur p-2 font-medium text-sm z-10">
												{date}
											</div>
											<div className="divide-y divide-border">
												{notifications.map((notification) => (
													<div
														key={notification.id}
														className={cn(
															"p-3 hover:bg-muted/50 transition-colors relative",
															!notification.isRead && "bg-muted/20"
														)}>
														<div className="flex gap-3">
															<div className="flex-shrink-0 mt-0.5">
																{getNotificationIcon(notification.type)}
															</div>
															<div className="flex-1 min-w-0">
																<div className="flex justify-between items-start">
																	<h3
																		className={cn(
																			"text-sm font-medium",
																			!notification.isRead && "font-semibold"
																		)}>
																		{notification.title}
																	</h3>
																	<div className="flex items-center gap-1">
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
																		<DropdownMenu>
																			<DropdownMenuTrigger asChild>
																				<Button
																					variant="ghost"
																					size="icon"
																					className="h-6 w-6">
																					<span className="sr-only">
																						Actions
																					</span>
																					<span className="h-1 w-1 rounded-full bg-foreground inline-block"></span>
																					<span className="h-1 w-1 rounded-full bg-foreground inline-block ml-0.5"></span>
																					<span className="h-1 w-1 rounded-full bg-foreground inline-block ml-0.5"></span>
																				</Button>
																			</DropdownMenuTrigger>
																			<DropdownMenuContent align="end">
																				<DropdownMenuLabel>
																					Actions
																				</DropdownMenuLabel>
																				<DropdownMenuSeparator />
																				{!notification.isRead && (
																					<DropdownMenuItem
																						onClick={() =>
																							handleMarkAsRead(notification.id)
																						}>
																						<Check className="h-4 w-4 mr-2" />
																						Mark as read
																					</DropdownMenuItem>
																				)}
																				<DropdownMenuItem
																					onClick={() =>
																						handleDismiss(notification.id)
																					}>
																					<Trash2 className="h-4 w-4 mr-2" />
																					Delete
																				</DropdownMenuItem>
																			</DropdownMenuContent>
																		</DropdownMenu>
																	</div>
																</div>
																<p className="text-sm text-muted-foreground mt-1">
																	{notification.message}
																</p>
																<div className="mt-2">
																	{notification.isActionRequired && (
																		<Badge
																			variant="outline"
																			className="mr-2">
																			Action Required
																		</Badge>
																	)}
																	{notification.actionUrl && (
																		<Button
																			variant="link"
																			size="sm"
																			className="p-0 h-auto text-sm"
																			asChild>
																			<Link to={notification.actionUrl}>
																				View Details
																			</Link>
																		</Button>
																	)}
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									)
								)}
							</div>
						</ScrollArea>
					)}
				</div>
			</div>
		</>
	);
}
