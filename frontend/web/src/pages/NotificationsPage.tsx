import React, { useState, useEffect } from "react";
import { useNotifications } from "@/lib/notification-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
	Calendar as CalendarIcon,
	Clock,
	SearchX,
	Filter,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Notification } from "@/api";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { getNotificationIcon } from "@/utils/notifications";
import { Switch } from "@/components/ui/switch";
import {
	AlertTriangle,
	Briefcase,
	Calendar,
	FileEdit,
	Mail,
	MessageCircle,
	User,
} from "lucide-react";
import { NotificationItem } from "@/components/NotificationItem";
import { ContentContainer } from "@/components/ui/content-container";
import { PageHeader } from "@/components/ui/page-header";
import { ContentSection } from "@/components/ui/content-section";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ColumnDef } from "@tanstack/react-table";
import { useHeader } from "@/lib/header-context";

// Define columns outside the component to prevent re-renders
const columns: ColumnDef<Notification>[] = [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.getValue("id")}</span>
		),
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			const icon = getNotificationIcon(type);
			const label = getNotificationTypeLabel(type);
			return (
				<div className="flex items-center">
					<div className="mr-2 flex-shrink-0">{icon}</div>
					<span>{label}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "title",
		header: "Title",
		cell: ({ row }) => (
			<span className="font-medium">{row.getValue("title")}</span>
		),
	},
	{
		accessorKey: "message",
		header: "Message",
		cell: ({ row }) => (
			<div className="max-w-md truncate">{row.getValue("message")}</div>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Time",
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt") as string);
			return (
				<div className="flex items-center">
					<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
					<span>{formatDistanceToNow(date, { addSuffix: true })}</span>
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const notification = row.original;
			const isRead = notification.isRead;

			// Define functions here to be able to access them in the JSX
			// These will be properly defined in NotificationsPage component scope below
			const handleMarkAsReadClick = (id: string) => {};
			const handleDismissClick = (id: string) => {};

			return (
				<div className="flex items-center justify-end">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon">
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-[160px]">
							{!isRead && (
								<DropdownMenuItem
									onClick={() => handleMarkAsReadClick(notification.id)}>
									<Check className="mr-2 h-4 w-4" />
									<span>Mark as read</span>
								</DropdownMenuItem>
							)}
							{notification.actionUrl && (
								<DropdownMenuItem asChild>
									<Link to={notification.actionUrl}>
										<CalendarIcon className="mr-2 h-4 w-4" />
										<span>View Details</span>
									</Link>
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => handleDismissClick(notification.id)}>
								<Trash2 className="mr-2 h-4 w-4" />
								<span>Delete</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

// Helper function to get readable labels for notification types
function getNotificationTypeLabel(type: string): string {
	switch (type) {
		case "shift_update":
			return "Shift Update";
		case "shift_reminder":
			return "Reminder";
		case "request_update":
			return "Request Update";
		case "system":
			return "System";
		case "message":
			return "Message";
		case "document":
			return "Document";
		case "calendar":
			return "Calendar";
		case "user":
			return "User";
		case "email":
			return "Email";
		case "task":
			return "Task";
		default:
			return type.replace(/_/g, " ");
	}
}

export default function NotificationsPage() {
	const { updateHeader } = useHeader();
	const {
		notifications,
		loading,
		markAsRead,
		markAllAsRead,
		dismissNotification,
		dismissAllNotifications,
		refreshNotifications,
	} = useNotifications();

	// Table filters
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [searchQuery, setSearchQuery] = useState("");
	const [readFilter, setReadFilter] = useState<string | null>(null);
	const [typeFilter, setTypeFilter] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");

	// Available notification types with icons for filter
	const notificationTypes = [
		{
			value: "shift_update",
			label: "Shift Updates",
		},
		{
			value: "shift_reminder",
			label: "Reminders",
		},
		{
			value: "request_update",
			label: "Request Updates",
		},
		{
			value: "system",
			label: "System",
		},
		{
			value: "message",
			label: "Messages",
		},
		{
			value: "document",
			label: "Documents",
		},
		{
			value: "calendar",
			label: "Calendar",
		},
		{
			value: "user",
			label: "User",
		},
		{
			value: "email",
			label: "Email",
		},
		{
			value: "task",
			label: "Tasks",
		},
	];

	// Read status filter options
	const readStatusOptions = [
		{ value: "all", label: "All" },
		{ value: "unread", label: "Unread Only" },
		{ value: "read", label: "Read Only" },
	];

	// Use notifications directly
	const displayNotifications = notifications;

	// Fix the function names to match what's being called elsewhere in the file
	const handleMarkAsReadClick = (id: string) => {
		markAsRead(id);
	};

	const handleDismissClick = (id: string) => {
		dismissNotification(id);
	};

	// Filter notifications based on current filters
	const getFilteredNotifications = () => {
		return displayNotifications.filter((notification) => {
			// Filter by read status
			if (readFilter === "unread" && notification.isRead) return false;
			if (readFilter === "read" && !notification.isRead) return false;

			// Filter by type
			if (typeFilter && notification.type !== typeFilter) return false;

			// Filter by search query
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					notification.title.toLowerCase().includes(query) ||
					notification.message.toLowerCase().includes(query)
				);
			}

			return true;
		});
	};

	const filteredNotifications = getFilteredNotifications();

	// Calculate pagination
	const totalPages = Math.ceil(filteredNotifications.length / pageSize);
	const paginatedNotifications = filteredNotifications.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Handle page size change
	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1);
	};

	// Clear all filters
	const handleClearFilters = () => {
		setSearchQuery("");
		setReadFilter(null);
		setTypeFilter(null);
		setCurrentPage(1);
	};

	// Get filter label for display
	const getTypeFilterLabel = () => {
		if (!typeFilter) return "All Types";
		const selectedType = notificationTypes.find(
			(type) => type.value === typeFilter
		);
		return selectedType ? selectedType.label : "All Types";
	};

	// Determine if any filters are active
	const hasActiveFilters = Boolean(searchQuery || readFilter || typeFilter);

	// Notification card for card view
	const NotificationCard = ({
		notification,
	}: {
		notification: Notification;
	}) => {
		const icon = getNotificationIcon(notification.type);
		const formattedTime = formatDistanceToNow(
			new Date(notification.createdAt),
			{
				addSuffix: true,
			}
		);

		return (
			<Card
				className={cn(!notification.isRead && "bg-muted/10 border-primary/20")}>
				<CardContent className="p-4">
					<div className="flex items-start gap-4">
						<div
							className={cn(
								"rounded-full p-2 flex-shrink-0",
								!notification.isRead ? "bg-primary/10" : "bg-muted"
							)}>
							{icon}
						</div>

						<div className="flex-1 min-w-0">
							<div className="flex justify-between items-start gap-2">
								<div>
									<h3
										className={cn(
											"text-sm font-medium",
											!notification.isRead && "font-semibold"
										)}>
										{notification.title}
									</h3>
									<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
										{notification.message}
									</p>
								</div>
								<Badge
									variant={notification.isRead ? "outline" : "secondary"}
									className="ml-auto">
									{notification.isRead ? "Read" : "Unread"}
								</Badge>
							</div>

							<div className="flex justify-between items-center mt-3">
								<div className="flex items-center text-xs text-muted-foreground">
									<Clock className="h-3 w-3 mr-1" />
									<span>{formattedTime}</span>
								</div>

								<div className="flex items-center gap-2">
									{!notification.isRead && (
										<Button
											variant="outline"
											size="sm"
											className="h-7 px-2"
											onClick={() => handleMarkAsReadClick(notification.id)}>
											<Check className="h-3 w-3 mr-1" />
											Mark read
										</Button>
									)}

									<Button
										variant="outline"
										size="sm"
										className="h-7 px-2 text-destructive border-destructive/20 hover:bg-destructive/10"
										onClick={() => handleDismissClick(notification.id)}>
										<Trash2 className="h-3 w-3 mr-1" />
										Delete
									</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
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
				onClick={markAllAsRead}
				disabled={filteredNotifications.filter((n) => !n.isRead).length === 0}>
				<Check className="h-4 w-4 mr-2" />
				Mark All Read
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={dismissAllNotifications}
				disabled={filteredNotifications.length === 0}>
				<Trash2 className="h-4 w-4 mr-2" />
				Clear All
			</Button>
		</div>
	);

	// Set page header
	useEffect(() => {
		updateHeader({
			title: "Notifications",
			description: "Manage and view your notifications",
			actions: (
				<Button
					onClick={markAllAsRead}
					variant="outline"
					className="flex items-center">
					<Check className="mr-2 h-4 w-4" />
					Mark All as Read
				</Button>
			),
		});
	}, [updateHeader, markAllAsRead]);

	return (
		<>
			<div className="sticky top-0 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 z-40">
				<div className="flex flex-1 items-center">
					<div className="mx-4">
						<h1 className="text-lg font-semibold">Notifications</h1>
						<p className="text-xs text-muted-foreground">
							Manage and view all your notifications
						</p>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3">
					{headerActions}
				</div>
			</div>

			<ContentContainer>
				<ContentSection title="Notification Management">
					{/* Read status filter */}
					<div className="flex items-center gap-2 mt-4">
						<Select
							value={readFilter || "all"}
							onValueChange={(value) => {
								setReadFilter(value === "all" ? null : value);
								setCurrentPage(1);
							}}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								{readStatusOptions.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Notification count */}
					<div className="mt-4">
						<p className="text-sm text-muted-foreground">
							{filteredNotifications.length === 0
								? "No notifications found"
								: `Showing ${filteredNotifications.length} notification${
										filteredNotifications.length !== 1 ? "s" : ""
								  }`}
						</p>
					</div>

					{/* Notifications content */}
					<div className="mt-6">
						{loading ? (
							<div className="flex flex-col items-center justify-center p-8">
								<RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
								<p className="text-muted-foreground">
									Loading notifications...
								</p>
							</div>
						) : filteredNotifications.length === 0 ? (
							<EmptyState
								icon={<Bell className="h-10 w-10" />}
								title="No notifications found"
								description={
									notifications.length > 0
										? "Try changing your filters to see more notifications"
										: "You don't have any notifications yet. They'll appear here when you receive them."
								}
								action={
									hasActiveFilters ? (
										<Button
											variant="outline"
											onClick={handleClearFilters}>
											Clear filters
										</Button>
									) : undefined
								}
							/>
						) : viewMode === "table" ? (
							<>
								<DataTable
									columns={columns}
									data={paginatedNotifications}
								/>
							</>
						) : (
							<>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									{paginatedNotifications.map((notification) => (
										<NotificationCard
											key={notification.id}
											notification={notification}
										/>
									))}
								</div>
							</>
						)}
					</div>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
