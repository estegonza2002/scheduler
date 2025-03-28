import React, { createContext, useContext, useEffect, useState } from "react";
import { Notification, NotificationsAPI } from "@/api";
import { useAuth } from "./auth";
import { toast } from "sonner";

type NotificationContextType = {
	notifications: Notification[];
	unreadCount: number;
	loading: boolean;
	error: Error | null;
	markAsRead: (id: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	dismissNotification: (id: string) => Promise<void>;
	dismissAllNotifications: () => Promise<void>;
	refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user } = useAuth();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const unreadCount = notifications.filter(
		(n: Notification) => !n.isRead
	).length;

	// Fetch notifications on load and when user changes
	useEffect(() => {
		if (user) {
			fetchNotifications();
		} else {
			setNotifications([]);
			setLoading(false);
		}
	}, [user]);

	// Set up a polling mechanism for real-time updates
	useEffect(() => {
		if (!user) return;

		const interval = setInterval(() => {
			fetchUnreadNotifications();
		}, 30000); // Check for new notifications every 30 seconds

		return () => clearInterval(interval);
	}, [user]);

	const fetchNotifications = async () => {
		if (!user) return;

		setLoading(true);

		const userId = user.id;
		if (!userId) {
			console.error("No user ID available");
			setLoading(false);
			return;
		}

		try {
			const notifications = await NotificationsAPI.getAll(userId);
			setNotifications(notifications);
			setError(null);
		} catch (error) {
			console.error("Error fetching notifications:", error);
			setError(
				error instanceof Error
					? error
					: new Error("Failed to fetch notifications")
			);
		} finally {
			setLoading(false);
		}
	};

	const fetchUnreadNotifications = async () => {
		if (!user) return;

		try {
			const userId = user.id;
			if (!userId) {
				console.error("No user ID available");
				return;
			}
			const currentIds = new Set(notifications.map((n: Notification) => n.id));

			try {
				const unreadNotifications = await NotificationsAPI.getUnread(userId);

				// Find only new notifications not currently in the state
				const newNotifications = unreadNotifications.filter(
					(n: Notification) => !currentIds.has(n.id)
				);

				if (newNotifications.length > 0) {
					// Show toast for new notifications
					newNotifications.forEach((notification: Notification) => {
						toast(notification.title, {
							description: notification.message,
							action: {
								label: "View",
								onClick: () => markAsRead(notification.id),
							},
						});
					});

					// Update the notifications state
					setNotifications((prev) => [...newNotifications, ...prev]);
				}
			} catch (apiErr) {
				console.error("Error calling getUnread API:", apiErr);
			}
		} catch (err) {
			console.error("Error fetching unread notifications:", err);
		}
	};

	const markAsRead = async (notificationId: string) => {
		if (!user) return;

		const userId = user.id;
		if (!userId) {
			console.error("No user ID available");
			return;
		}

		try {
			await NotificationsAPI.markAsRead(notificationId);
			await fetchNotifications();
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const markAllAsRead = async () => {
		if (!user) return;

		try {
			const userId = user.id;
			if (!userId) {
				console.error("No user ID available");
				return;
			}

			try {
				await NotificationsAPI.markAllAsRead(userId);

				// Update local state to reflect the change
				setNotifications((prev) =>
					prev.map((notification) => ({ ...notification, isRead: true }))
				);
			} catch (apiErr) {
				console.error("Error calling markAllAsRead API:", apiErr);
			}
		} catch (err) {
			console.error("Error marking all notifications as read:", err);
		}
	};

	const dismissNotification = async (id: string) => {
		try {
			try {
				await NotificationsAPI.dismissNotification(id);

				// Update local state to reflect the change
				setNotifications((prev) =>
					prev.filter((notification) => notification.id !== id)
				);
			} catch (apiErr) {
				console.error("Error calling dismissNotification API:", apiErr);
			}
		} catch (err) {
			console.error("Error dismissing notification:", err);
		}
	};

	const dismissAllNotifications = async () => {
		if (!user) return;

		try {
			const userId = user.id;
			if (!userId) {
				console.error("No user ID available");
				return;
			}

			try {
				await NotificationsAPI.dismissAllNotifications(userId);

				// Update local state to reflect the change
				setNotifications([]);
			} catch (apiErr) {
				console.error("Error calling dismissAllNotifications API:", apiErr);
			}
		} catch (err) {
			console.error("Error dismissing all notifications:", err);
		}
	};

	const refreshNotifications = async () => {
		await fetchNotifications();
	};

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				loading,
				error,
				markAsRead,
				markAllAsRead,
				dismissNotification,
				dismissAllNotifications,
				refreshNotifications,
			}}>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error(
			"useNotifications must be used within a NotificationProvider"
		);
	}
	return context;
};
