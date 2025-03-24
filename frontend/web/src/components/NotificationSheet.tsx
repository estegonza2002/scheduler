import { useState } from "react";
import { Bell } from "lucide-react";
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
import { getNotificationIcon } from "../utils/notifications";
import { NotificationItem } from "./NotificationItem";

// Sample notifications for mockup purposes only
export const sampleNotifications = [
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
		useSampleData,
	} = useNotifications();

	const [open, setOpen] = useState(false);

	const displayNotifications = useSampleData
		? sampleNotifications
		: notifications;

	const displayUnreadCount = useSampleData
		? sampleNotifications.filter((n) => !n.isRead).length
		: unreadCount;

	const handleMarkAllAsRead = () => {
		if (useSampleData) {
			// Just for demonstration - no actual action
		} else {
			markAllAsRead();
		}
	};

	const handleDismissAll = () => {
		if (useSampleData) {
			// Just for demonstration - no actual action
		} else {
			dismissAllNotifications();
		}
	};

	const handleNotificationClick = (id: string, url?: string) => {
		if (!useSampleData) {
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
					variant="outline"
					size="icon"
					className="relative rounded-full">
					<Bell className="h-5 w-5" />
					{displayUnreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full">
							{displayUnreadCount > 9 ? "9+" : displayUnreadCount}
						</Badge>
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
									displayNotifications.length === 0 ||
									displayNotifications.every((n) => n.isRead)
								}>
								Mark all read
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="text-sm h-8 rounded-full"
								onClick={handleDismissAll}
								disabled={loading || displayNotifications.length === 0}>
								Clear all
							</Button>
						</div>
						{displayUnreadCount > 0 && (
							<Badge
								variant="secondary"
								className="px-2.5">
								{displayUnreadCount} unread
							</Badge>
						)}
					</div>

					<ScrollArea className="flex-1">
						<div className="p-0">
							{loading ? (
								<div className="flex items-center justify-center p-6">
									<div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-primary"></div>
								</div>
							) : displayNotifications.length === 0 ? (
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
									{displayNotifications.map((notification) => (
										<NotificationItem
											key={notification.id}
											notification={notification}
											onMarkAsRead={markAsRead}
											onDismiss={dismissNotification}
											useSampleData={useSampleData}
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
