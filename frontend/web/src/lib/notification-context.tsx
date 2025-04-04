import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import { Notification, NotificationsAPI } from "@/api";
import { useAuth } from "./auth";
import { toast } from "sonner";
import { Notification as NotificationType } from "@/api/types";

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

	// Fetch notifications function
	const fetchNotifications = useCallback(async () => {
		if (!user) return;

		setLoading(true);

		const userId = user.uid;
		if (!userId) {
			console.error("No user ID available");
			setLoading(false);
			return;
		}

		try {
			const notifications = await NotificationsAPI.getAll(userId);
			console.log("Fetched notifications:", notifications);
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
	}, [user]);

	// Fetch notifications on load and when user changes
	useEffect(() => {
		if (user) {
			fetchNotifications();
		} else {
			setNotifications([]);
			setLoading(false);
		}

		return () => {
			// No cleanup needed now
		};
	}, [user, fetchNotifications]);

	const markAsRead = async (notificationId: string) => {
		if (!user) return;

		const userId = user.uid;
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
			const userId = user.uid;
			if (!userId) {
				console.error("No user ID available");
				return;
			}

			try {
				await NotificationsAPI.markAllAsRead(userId);
				await fetchNotifications();
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
				await fetchNotifications();
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
			const userId = user.uid;
			if (!userId) {
				console.error("No user ID available");
				return;
			}

			try {
				await NotificationsAPI.dismissAllNotifications(userId);
				await fetchNotifications();
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

export const useNotificationsContext = () => {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error(
			"useNotifications must be used within a NotificationProvider"
		);
	}
	return context;
};
