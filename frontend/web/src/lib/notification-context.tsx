import React, { createContext, useContext, useEffect, useState } from "react";
import { Notification, NotificationsAPI } from "@/api";
import { useAuth } from "./auth";
import { toast } from "sonner";

// Import the USE_MOCK_API value from the constants file
// This ensures the toggle is in one place only
import { USE_MOCK_API } from "../constants";

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
	useSampleData: boolean;
	toggleSampleData: () => void;
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

	// Use the global mock API toggle instead of having a separate state
	// This way we only have one place to toggle sample data
	const [useSampleData, setUseSampleData] = useState(USE_MOCK_API);

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
	}, [user, useSampleData]);

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
		try {
			const userId = user.id || "user-1"; // Fallback for mock data
			const data = await NotificationsAPI.getAll(userId);
			setNotifications(data);
			setError(null);
		} catch (err) {
			console.error("Error fetching notifications:", err);
			setError(
				err instanceof Error ? err : new Error("Error fetching notifications")
			);
		} finally {
			setLoading(false);
		}
	};

	const fetchUnreadNotifications = async () => {
		if (!user) return;

		try {
			const userId = user.id || "user-1"; // Fallback for mock data
			const currentIds = new Set(notifications.map((n: Notification) => n.id));

			// Only call this if the API supports it
			const api = NotificationsAPI as any;
			if (typeof api.getUnread === "function") {
				const unreadNotifications = await api.getUnread(userId);

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
			}
		} catch (err) {
			console.error("Error fetching unread notifications:", err);
		}
	};

	const markAsRead = async (id: string) => {
		try {
			await NotificationsAPI.markAsRead(id);
			setNotifications((prev) =>
				prev.map((notification) =>
					notification.id === id
						? { ...notification, isRead: true }
						: notification
				)
			);
		} catch (err) {
			console.error("Error marking notification as read:", err);
		}
	};

	const markAllAsRead = async () => {
		if (!user) return;

		try {
			const userId = user.id || "user-1";

			// Only call this if the API supports it
			const api = NotificationsAPI as any;
			if (typeof api.markAllAsRead === "function") {
				await api.markAllAsRead(userId);
			}

			setNotifications((prev) =>
				prev.map((notification) => ({ ...notification, isRead: true }))
			);
		} catch (err) {
			console.error("Error marking all notifications as read:", err);
		}
	};

	const dismissNotification = async (id: string) => {
		try {
			// Only call this if the API supports it
			const api = NotificationsAPI as any;
			if (typeof api.dismissNotification === "function") {
				await api.dismissNotification(id);
			}

			setNotifications((prev) =>
				prev.filter((notification) => notification.id !== id)
			);
		} catch (err) {
			console.error("Error dismissing notification:", err);
		}
	};

	const dismissAllNotifications = async () => {
		if (!user) return;

		try {
			const userId = user.id || "user-1";

			// Only call this if the API supports it
			const api = NotificationsAPI as any;
			if (typeof api.dismissAllNotifications === "function") {
				await api.dismissAllNotifications(userId);
			}

			setNotifications([]);
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
				useSampleData,
				toggleSampleData: () => setUseSampleData((prev: boolean) => !prev),
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
