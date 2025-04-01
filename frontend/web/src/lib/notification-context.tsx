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
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

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
	const [notificationsChannel, setNotificationsChannel] =
		useState<RealtimeChannel | null>(null);

	const unreadCount = notifications.filter(
		(n: Notification) => !n.isRead
	).length;

	// Fetch notifications function
	const fetchNotifications = useCallback(async () => {
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

	// Set up Supabase real-time subscriptions
	const setupRealtimeSubscriptions = useCallback(() => {
		if (!user) {
			console.log("No user available for subscriptions");
			return;
		}

		const userId = user.id;
		if (!userId) {
			console.error("No user ID available for subscriptions");
			return;
		}

		console.log("Setting up real-time subscriptions for notifications");

		// Subscribe to notification changes for this user
		const notificationsSubscription = supabase
			.channel("notifications-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "notifications",
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log("Notification change detected:", payload);

					if (payload.eventType === "INSERT") {
						console.log("New notification:", payload.new);

						// Map the snake_case column names to camelCase property names
						const newNotification = {
							id: payload.new.id,
							userId: payload.new.user_id,
							organizationId: payload.new.organization_id,
							type: payload.new.type,
							title: payload.new.title,
							message: payload.new.message,
							isRead: payload.new.is_read,
							isActionRequired: payload.new.is_action_required,
							actionUrl: payload.new.action_url,
							relatedEntityId: payload.new.related_entity_id,
							relatedEntityType: payload.new.related_entity_type,
							createdAt: payload.new.created_at,
						} as Notification;

						// Show toast for new notification
						toast(newNotification.title, {
							description: newNotification.message,
							action: {
								label: "View",
								onClick: () => markAsRead(newNotification.id),
							},
						});

						// Add to state
						setNotifications((prev) => [newNotification, ...prev]);
					} else if (payload.eventType === "UPDATE") {
						console.log("Updated notification:", payload.new);

						// Map the snake_case column names to camelCase property names
						const updatedNotification = {
							id: payload.new.id,
							userId: payload.new.user_id,
							organizationId: payload.new.organization_id,
							type: payload.new.type,
							title: payload.new.title,
							message: payload.new.message,
							isRead: payload.new.is_read,
							isActionRequired: payload.new.is_action_required,
							actionUrl: payload.new.action_url,
							relatedEntityId: payload.new.related_entity_id,
							relatedEntityType: payload.new.related_entity_type,
							createdAt: payload.new.created_at,
						} as Notification;

						// Update state
						setNotifications((prev) =>
							prev.map((notification) =>
								notification.id === updatedNotification.id
									? updatedNotification
									: notification
							)
						);
					} else if (payload.eventType === "DELETE") {
						console.log("Deleted notification:", payload.old);

						// Remove from state
						setNotifications((prev) =>
							prev.filter((notification) => notification.id !== payload.old.id)
						);
					}
				}
			)
			.subscribe((status) => {
				console.log("Notifications subscription status:", status);
			});

		// Save channel reference for cleanup
		setNotificationsChannel(notificationsSubscription);
	}, [user]);

	// Fetch notifications on load and when user changes
	useEffect(() => {
		if (user) {
			fetchNotifications();
			setupRealtimeSubscriptions();
		} else {
			setNotifications([]);
			setLoading(false);

			// Cleanup any existing subscription
			if (notificationsChannel) {
				notificationsChannel.unsubscribe();
				setNotificationsChannel(null);
			}
		}

		// Cleanup subscriptions when component unmounts or user changes
		return () => {
			if (notificationsChannel) {
				console.log("Cleaning up notifications subscription");
				notificationsChannel.unsubscribe();
			}
		};
	}, [user, fetchNotifications, setupRealtimeSubscriptions]);

	const markAsRead = async (notificationId: string) => {
		if (!user) return;

		const userId = user.id;
		if (!userId) {
			console.error("No user ID available");
			return;
		}

		try {
			await NotificationsAPI.markAsRead(notificationId);
			// No need to fetch again as the subscription will update the UI
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
				// No need to update state as the subscription will handle it
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
				// No need to update state as the subscription will handle it
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
				// No need to update state as the subscription will handle it
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
