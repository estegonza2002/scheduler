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
import {
	Bell,
	Check,
	Search,
	Trash2,
	RefreshCw,
	Settings,
	Database,
	X,
	ChevronDown,
} from "lucide-react";
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
	DropdownMenuCheckboxItem,
} from "../components/ui/dropdown-menu";
import { getNotificationIcon } from "../utils/notifications";
import { Switch } from "../components/ui/switch";
import { sampleNotifications } from "../components/NotificationSheet";
import {
	AlertTriangle,
	Briefcase,
	Calendar,
	Clock,
	FileEdit,
	Mail,
	MessageCircle,
	User,
} from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { NotificationItem } from "../components/NotificationItem";

import { ContentContainer } from "../components/ui/content-container";
import { PageHeader } from "../components/ui/page-header";
import { ContentSection } from "../components/ui/content-section";

export default function NotificationsPage() {
	const {
		notifications,
		loading,
		markAsRead,
		markAllAsRead,
		dismissNotification,
		dismissAllNotifications,
		refreshNotifications,
		useSampleData,
		toggleSampleData,
	} = useNotifications();

	const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
	const [selectedTypes, setSelectedTypes] = useState<string[]>(["all"]);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

	// Available notification types with icons
	const notificationTypes = [
		{ value: "all", label: "All types" },
		{
			value: "shift_update",
			label: "Shift Updates",
			icon: <Clock className="h-4 w-4 text-blue-500 mr-2" />,
		},
		{
			value: "shift_reminder",
			label: "Reminders",
			icon: <Bell className="h-4 w-4 text-purple-500 mr-2" />,
		},
		{
			value: "request_update",
			label: "Request Updates",
			icon: <Check className="h-4 w-4 text-green-500 mr-2" />,
		},
		{
			value: "system",
			label: "System",
			icon: <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />,
		},
		{
			value: "message",
			label: "Messages",
			icon: <MessageCircle className="h-4 w-4 text-indigo-500 mr-2" />,
		},
		{
			value: "document",
			label: "Documents",
			icon: <FileEdit className="h-4 w-4 text-rose-500 mr-2" />,
		},
		{
			value: "calendar",
			label: "Calendar",
			icon: <Calendar className="h-4 w-4 text-cyan-500 mr-2" />,
		},
		{
			value: "user",
			label: "User",
			icon: <User className="h-4 w-4 text-emerald-500 mr-2" />,
		},
		{
			value: "email",
			label: "Email",
			icon: <Mail className="h-4 w-4 text-orange-500 mr-2" />,
		},
		{
			value: "task",
			label: "Tasks",
			icon: <Briefcase className="h-4 w-4 text-violet-500 mr-2" />,
		},
	];

	// Handle type selection
	const toggleType = (type: string) => {
		if (type === "all") {
			setSelectedTypes(["all"]);
			return;
		}

		// Remove 'all' if it's in the selection and we're selecting something else
		let newSelection = selectedTypes.filter((t) => t !== "all");

		if (selectedTypes.includes(type)) {
			newSelection = newSelection.filter((t) => t !== type);
		} else {
			newSelection.push(type);
		}

		if (newSelection.length === 0) {
			setSelectedTypes(["all"]);
		} else {
			setSelectedTypes(newSelection);
		}
	};

	// Use sample notifications when useSampleData is true
	const displayNotifications = useSampleData
		? sampleNotifications
		: notifications;

	// Filter notifications based on current filters
	const filteredNotifications = displayNotifications
		.filter((notification) => {
			// Apply read/unread filter
			if (filter === "unread" && notification.isRead) return false;
			if (filter === "read" && !notification.isRead) return false;

			// Apply type filter - now supports multiple types
			if (
				!selectedTypes.includes("all") &&
				!selectedTypes.includes(notification.type)
			)
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
	const groupedNotifications: {
		[key: string]: (typeof displayNotifications)[number][];
	} = {};

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
		if (!useSampleData) {
			markAsRead(id);
		}
	};

	const handleDismiss = (id: string) => {
		if (!useSampleData) {
			dismissNotification(id);
		}
	};

	const handleMarkAllAsRead = () => {
		if (!useSampleData) {
			markAllAsRead();
		}
	};

	const handleClearAll = () => {
		if (!useSampleData) {
			dismissAllNotifications();
		}
	};

	// Notification actions for the page header
	const headerActions = (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={() => refreshNotifications()}
				disabled={loading}>
				<RefreshCw
					className={cn(
						"h-4 w-4 mr-2",
						loading ? "animate-spin" : "text-muted-foreground"
					)}
				/>
				Refresh
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={handleMarkAllAsRead}
				disabled={filteredNotifications.filter((n) => !n.isRead).length === 0}>
				<Check className="h-4 w-4 mr-2" />
				Mark All Read
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={handleClearAll}
				disabled={filteredNotifications.length === 0}>
				<Trash2 className="h-4 w-4 mr-2" />
				Clear All
			</Button>
		</div>
	);

	return (
		<>
			<PageHeader
				title="Notifications"
				description="Manage and view all your notifications"
				actions={headerActions}
			/>

			<ContentContainer>
				<ContentSection
					title="Notification Filters"
					description="Search and filter your notifications"
					flat>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search notifications..."
								className="pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<div className="flex flex-wrap gap-2">
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

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="w-[150px] justify-between">
										<span className="truncate">
											{selectedTypes.includes("all")
												? "All types"
												: `${selectedTypes.length} selected`}
										</span>
										<ChevronDown className="h-4 w-4 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-[220px]">
									<DropdownMenuLabel>Notification Types</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<ScrollArea className="h-[300px]">
										<div className="p-1">
											<div
												className="relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
												onClick={() => toggleType("all")}>
												<div className="mr-2 h-4 w-4 flex items-center justify-center">
													{selectedTypes.includes("all") && (
														<Check className="h-4 w-4" />
													)}
												</div>
												<span>All types</span>
											</div>

											{notificationTypes
												.filter((t) => t.value !== "all")
												.map((type) => (
													<div
														key={type.value}
														className="relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
														onClick={() => toggleType(type.value)}>
														<div className="mr-2 h-4 w-4 flex items-center justify-center">
															{selectedTypes.includes(type.value) && (
																<Check className="h-4 w-4" />
															)}
														</div>
														{type.icon}
														<span>{type.label}</span>
													</div>
												))}
										</div>
									</ScrollArea>
								</DropdownMenuContent>
							</DropdownMenu>

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

					{/* Display selected types as badges if not "all" */}
					{!selectedTypes.includes("all") && selectedTypes.length > 0 && (
						<div className="flex flex-wrap gap-1 items-center mt-4">
							<span className="text-sm text-muted-foreground mr-1">
								Filtered by:
							</span>
							{selectedTypes.map((typeValue) => {
								const typeObj = notificationTypes.find(
									(t) => t.value === typeValue
								);
								return (
									<Badge
										key={typeValue}
										variant="outline"
										className="flex items-center gap-1 pr-1">
										{typeObj?.icon && (
											<span className="scale-75">{typeObj.icon}</span>
										)}
										<span>
											{typeObj?.label
												.replace(" Updates", "")
												.replace(" Notifications", "")}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-4 w-4 ml-1 hover:bg-muted"
											onClick={() => toggleType(typeValue)}>
											<X className="h-3 w-3" />
										</Button>
									</Badge>
								);
							})}
							<Button
								variant="ghost"
								size="sm"
								className="text-xs h-7"
								onClick={() => setSelectedTypes(["all"])}>
								Clear filters
							</Button>
						</div>
					)}

					<div className="flex justify-between items-center mt-4">
						<p className="text-sm text-muted-foreground font-medium bg-muted/40 px-3 py-1 rounded-full">
							{filteredNotifications.length === 0
								? "No notifications found"
								: `Showing ${filteredNotifications.length} notification${
										filteredNotifications.length !== 1 ? "s" : ""
								  }${useSampleData ? " (Sample Data)" : ""}`}
						</p>
					</div>
				</ContentSection>

				<ContentSection
					title="Notification Messages"
					description="Your latest notifications and alerts"
					className="mt-6">
					{loading ? (
						<div className="flex items-center justify-center p-6 border rounded-lg bg-background">
							<div className="animate-spin rounded-full h-6 w-6 border-2 border-b-transparent border-primary"></div>
						</div>
					) : filteredNotifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-background">
							<div className="bg-muted/30 p-4 rounded-full mb-3">
								<Bell className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-medium">No notifications found</h3>
							<p className="text-sm text-muted-foreground mt-1 max-w-sm">
								{notifications.length > 0
									? "Try changing your filters to see more notifications"
									: "You don't have any notifications yet. They'll appear here when you receive them."}
							</p>
						</div>
					) : (
						<div className="border rounded-lg overflow-hidden bg-background">
							<div className="h-[calc(100vh-350px)] overflow-y-auto">
								{Object.entries(groupedNotifications).map(
									([date, notifications]) => (
										<div
											key={date}
											className="relative">
											<div className="sticky top-0 z-20 py-2 px-4 font-medium text-primary bg-background/95 backdrop-blur-sm border-b shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
												{date}
											</div>
											{notifications.map((notification) => (
												<NotificationItem
													key={notification.id}
													notification={notification}
													onMarkAsRead={handleMarkAsRead}
													onDismiss={handleDismiss}
													useSampleData={useSampleData}
												/>
											))}
										</div>
									)
								)}
							</div>
						</div>
					)}
				</ContentSection>
			</ContentContainer>
		</>
	);
}
