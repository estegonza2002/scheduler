import { useState } from "react";
import {
	Bell,
	AlertTriangle,
	Check,
	Clock,
	MessageCircle,
	User,
	Calendar,
	Mail,
	Briefcase,
	FileEdit,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useNotifications } from "../lib/notification-context";
import { CardContent } from "./ui/card";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";

// Internal helper for notification icons
const getNotificationIcon = (type: string) => {
	switch (type) {
		case "shift_update":
			return <Clock className="h-5 w-5 text-blue-500" />;
		case "shift_reminder":
			return <Bell className="h-5 w-5 text-purple-500" />;
		case "request_update":
			return <Check className="h-5 w-5 text-green-500" />;
		case "system":
			return <AlertTriangle className="h-5 w-5 text-amber-500" />;
		case "message":
			return <MessageCircle className="h-5 w-5 text-indigo-500" />;
		case "document":
			return <FileEdit className="h-5 w-5 text-rose-500" />;
		case "calendar":
			return <Calendar className="h-5 w-5 text-cyan-500" />;
		case "user":
			return <User className="h-5 w-5 text-emerald-500" />;
		case "email":
			return <Mail className="h-5 w-5 text-orange-500" />;
		case "task":
			return <Briefcase className="h-5 w-5 text-violet-500" />;
		default:
			return <Bell className="h-5 w-5 text-gray-500" />;
	}
};

// Sample notifications for mockup purposes only
const sampleNotifications = [
	{
		id: "notif-1",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_update",
		title: "Shift Schedule Updated",
		message: "Your shift on Monday has been rescheduled to 9 AM - 5 PM",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/shifts/shift-123",
		relatedEntityId: "shift-123",
		relatedEntityType: "shift",
		createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
	},
	{
		id: "notif-2",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_reminder",
		title: "Upcoming Shift Tomorrow",
		message:
			"Reminder: You have a shift tomorrow from 10 AM - 6 PM at Downtown Location",
		isRead: true,
		actionUrl: "/shifts/shift-456",
		relatedEntityId: "shift-456",
		relatedEntityType: "shift",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
	},
	{
		id: "notif-3",
		userId: "user-1",
		organizationId: "org-1",
		type: "request_update",
		title: "Time Off Request Approved",
		message: "Your time off request for next Friday has been approved",
		isRead: false,
		actionUrl: "/profile",
		relatedEntityId: "request-789",
		relatedEntityType: "timeoff_request",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
	},
	{
		id: "notif-4",
		userId: "user-1",
		organizationId: "org-1",
		type: "system",
		title: "Profile Update Required",
		message: "Please update your contact information in your profile",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/profile",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
	},
	{
		id: "notif-5",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_update",
		title: "New Shift Available",
		message: "A new shift is available for Tuesday. Tap to claim it.",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/shifts/shift-789",
		relatedEntityId: "shift-789",
		relatedEntityType: "shift",
		createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
	},
	{
		id: "notif-6",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_reminder",
		title: "Clock-in Reminder",
		message: "Your shift started 5 minutes ago. Don't forget to clock in!",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/shifts/shift-101",
		relatedEntityId: "shift-101",
		relatedEntityType: "shift",
		createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
	},
	{
		id: "notif-7",
		userId: "user-1",
		organizationId: "org-1",
		type: "message",
		title: "New Message from Manager",
		message: "Can you cover Sarah's shift on Thursday? She's out sick.",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/messages/123",
		createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
	},
	{
		id: "notif-8",
		userId: "user-1",
		organizationId: "org-1",
		type: "document",
		title: "Document Needs Signature",
		message: "New company policy document requires your signature by Friday",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/documents/policy-update",
		createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
	},
	{
		id: "notif-9",
		userId: "user-1",
		organizationId: "org-1",
		type: "calendar",
		title: "Team Meeting Added",
		message: "Monthly team meeting scheduled for next Monday at 10 AM",
		isRead: false,
		actionUrl: "/calendar/events/team-meeting",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
	},
	{
		id: "notif-10",
		userId: "user-1",
		organizationId: "org-1",
		type: "user",
		title: "New Employee Joined",
		message: "Michael Johnson has joined the team. Send a welcome message!",
		isRead: true,
		actionUrl: "/team/michael-johnson",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
	},
	{
		id: "notif-11",
		userId: "user-1",
		organizationId: "org-1",
		type: "email",
		title: "Important Email Received",
		message:
			"You have a new email from Regional Manager about next month's schedule",
		isRead: true,
		actionUrl: "/messages/emails/123",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 hours ago
	},
	{
		id: "notif-12",
		userId: "user-1",
		organizationId: "org-1",
		type: "task",
		title: "Task Assigned: Inventory Check",
		message:
			"You've been assigned to complete monthly inventory check by Wednesday",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/tasks/inventory-check",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
	},
	{
		id: "notif-13",
		userId: "user-1",
		organizationId: "org-1",
		type: "system",
		title: "System Maintenance",
		message: "The system will be down for maintenance on Sunday from 2-4 AM",
		isRead: true,
		actionUrl: "/announcements/system-maintenance",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
	},
	{
		id: "notif-14",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_update",
		title: "Shift Location Changed",
		message: "Your Friday shift has been moved to Downtown location",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/shifts/shift-456",
		createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
	},
	{
		id: "notif-15",
		userId: "user-1",
		organizationId: "org-1",
		type: "request_update",
		title: "Swap Request Accepted",
		message: "James accepted your request to swap shifts on Tuesday",
		isRead: false,
		actionUrl: "/shifts/swap-requests",
		createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(), // 40 minutes ago
	},
];

export function NotificationSheet() {
	const {
		notifications,
		unreadCount,
		loading,
		markAsRead,
		markAllAsRead,
		dismissNotification,
		dismissAllNotifications,
	} = useNotifications();

	const [open, setOpen] = useState(false);
	// State to toggle between real notifications and sample notifications
	const [showSampleNotifications, setShowSampleNotifications] = useState(true);

	const displayNotifications = showSampleNotifications
		? sampleNotifications
		: notifications;

	const displayUnreadCount = showSampleNotifications
		? sampleNotifications.filter((n) => !n.isRead).length
		: unreadCount;

	const handleMarkAllAsRead = () => {
		if (showSampleNotifications) {
			// Just for demonstration - no actual action
		} else {
			markAllAsRead();
		}
	};

	const handleDismissAll = () => {
		if (showSampleNotifications) {
			// Just for demonstration - no actual action
		} else {
			dismissAllNotifications();
		}
	};

	const handleNotificationClick = (id: string, url?: string) => {
		if (!showSampleNotifications) {
			markAsRead(id);
		}
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
					className="relative border rounded-md">
					<Bell className="h-5 w-5" />
					{displayUnreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center p-0 rounded-full"></Badge>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent className="sm:max-w-md p-0 flex flex-col h-[100dvh]">
				<>
					<SheetHeader className="p-0">
						<div className="px-4 py-3 flex items-center justify-between">
							<SheetTitle>Notifications</SheetTitle>
						</div>
					</SheetHeader>

					<div className="flex items-center px-4 py-2">
						<Button
							variant="outline"
							size="sm"
							className="text-sm h-8 mr-2"
							onClick={handleMarkAllAsRead}
							disabled={
								loading ||
								displayNotifications.length === 0 ||
								displayNotifications.every((n) => n.isRead)
							}>
							Mark all read
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="text-sm h-8 text-muted-foreground"
							onClick={handleDismissAll}
							disabled={loading || displayNotifications.length === 0}>
							Clear all
						</Button>
						<div className="flex-1"></div>
					</div>

					<ScrollArea className="flex-1">
						<CardContent className="p-0">
							{loading ? (
								<div className="flex items-center justify-center p-4">
									<div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-primary"></div>
								</div>
							) : displayNotifications.length === 0 ? (
								<div className="flex flex-col items-center justify-center p-6 text-center">
									<Bell className="h-8 w-8 text-muted-foreground mb-2" />
									<h3 className="text-lg font-medium">No notifications</h3>
									<p className="text-sm text-muted-foreground mt-1">
										You don't have any notifications yet
									</p>
								</div>
							) : (
								<div>
									{displayNotifications.map((notification) => (
										<div
											key={notification.id}
											className={cn(
												"px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors",
												!notification.isRead && "bg-muted/20"
											)}>
											<div className="flex gap-3">
												<div className="flex-shrink-0">
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
															<Button
																variant="ghost"
																size="icon"
																className="h-6 w-6"
																onClick={() =>
																	dismissNotification(notification.id)
																}>
																<span className="sr-only">Dismiss</span>
																<span className="text-xs">×</span>
															</Button>
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
																onClick={() =>
																	handleNotificationClick(
																		notification.id,
																		notification.actionUrl
																	)
																}
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
							)}
						</CardContent>
					</ScrollArea>
				</>
			</SheetContent>
		</Sheet>
	);
}
