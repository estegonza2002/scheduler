import { useEffect, useState } from "react";
import { Employee, EmployeesAPI } from "@/api";
import { supabase } from "./supabase";
import { toast } from "sonner";
import { useAuth } from "./auth";

// Real-time presence service configuration
const PRESENCE_UPDATE_INTERVAL = 30000; // 30 seconds

interface PresenceState {
	employeeId: string;
	isOnline: boolean;
	lastActive: string;
	name?: string; // Add employee name for notifications
}

let presenceSubscribers: ((state: Record<string, PresenceState>) => void)[] =
	[];
let presenceState: Record<string, PresenceState> = {};
let notifyStatusChange = true; // Flag to control status change notifications
let presenceChannel: any = null;

// Initialize the real-time presence service
export const initializePresence = async (
	employees: Employee[],
	userId: string | undefined
) => {
	// Initialize presence state with all employees (initially offline)
	employees.forEach((employee) => {
		presenceState[employee.id] = {
			employeeId: employee.id,
			isOnline: false,
			lastActive: employee.lastActive || new Date().toISOString(),
			name: employee.name,
		};
	});

	// If there's no user ID, we can't track presence, but we still return the initial state
	if (!userId) {
		console.warn("No user ID available for presence tracking");
		return () => {}; // Return empty cleanup function
	}

	try {
		// Set up a presence channel for this organization
		const channelId = `presence-${employees[0]?.organizationId || "global"}`;
		presenceChannel = supabase.channel(channelId);

		presenceChannel
			.on("presence", { event: "sync" }, () => {
				// Get the full state from the channel
				const state = presenceChannel.presenceState();
				console.log("Presence synced:", state);

				// Update our presence state with the new data
				Object.keys(state).forEach((employeeId) => {
					const presences = state[employeeId];
					if (presences && presences.length > 0) {
						const presence = presences[0]; // Get the first presence entry for this employee

						presenceState[employeeId] = {
							employeeId,
							isOnline: true,
							lastActive: presence.last_active || new Date().toISOString(),
							name: presence.name || presenceState[employeeId]?.name,
						};
					}
				});

				// Notify subscribers
				presenceSubscribers.forEach((callback) =>
					callback({ ...presenceState })
				);
			})
			.on(
				"presence",
				{ event: "join" },
				({ key, newPresences }: { key: string; newPresences: any[] }) => {
					// Handle user joining
					console.log("Join event:", key, newPresences);

					if (newPresences && newPresences.length > 0) {
						const employeeId = key;
						const presence = newPresences[0];
						const wasOnline = presenceState[employeeId]?.isOnline || false;
						const employeeName =
							presence.name || presenceState[employeeId]?.name || "An employee";

						presenceState[employeeId] = {
							employeeId,
							isOnline: true,
							lastActive: presence.last_active || new Date().toISOString(),
							name: presence.name || presenceState[employeeId]?.name,
						};

						// Show notification if status changed and notifications are enabled
						if (!wasOnline && notifyStatusChange) {
							toast.success(`${employeeName} is now online`, {
								id: `login-${employeeId}`,
								duration: 3000,
							});
						}

						// Notify subscribers
						presenceSubscribers.forEach((callback) =>
							callback({ ...presenceState })
						);
					}
				}
			)
			.on(
				"presence",
				{ event: "leave" },
				({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
					// Handle user leaving
					console.log("Leave event:", key, leftPresences);

					if (leftPresences && leftPresences.length > 0) {
						const employeeId = key;
						const wasOnline = presenceState[employeeId]?.isOnline || false;
						const employeeName =
							presenceState[employeeId]?.name || "An employee";

						presenceState[employeeId] = {
							...presenceState[employeeId],
							isOnline: false,
							lastActive: new Date().toISOString(),
						};

						// Show notification if status changed and notifications are enabled
						if (wasOnline && notifyStatusChange) {
							toast.info(`${employeeName} went offline`, {
								id: `logout-${employeeId}`,
								duration: 3000,
							});
						}

						// Notify subscribers
						presenceSubscribers.forEach((callback) =>
							callback({ ...presenceState })
						);
					}
				}
			);

		// Subscribe to the channel
		await presenceChannel.subscribe(async (status: string) => {
			console.log("Presence channel status:", status);

			if (status === "SUBSCRIBED") {
				// Find employee record for the current user
				const userEmployee = employees.find((emp) => emp.id === userId);

				// Start tracking this user's presence
				await presenceChannel.track({
					id: userId,
					name: userEmployee?.name || "Unknown user",
					last_active: new Date().toISOString(),
				});

				console.log("Tracking presence for:", userId);
			}
		});

		// Return cleanup function
		return () => {
			if (presenceChannel) {
				presenceChannel.unsubscribe();
				presenceChannel = null;
			}
		};
	} catch (error) {
		console.error("Error setting up presence channel:", error);
		return () => {}; // Return empty cleanup function
	}
};

// Subscribe to presence updates
export const subscribeToPresence = (
	callback: (state: Record<string, PresenceState>) => void
) => {
	presenceSubscribers.push(callback);
	return () => {
		presenceSubscribers = presenceSubscribers.filter((cb) => cb !== callback);
	};
};

// Enable or disable status change notifications
export const setStatusChangeNotifications = (enabled: boolean) => {
	notifyStatusChange = enabled;
};

// Hook to use employee presence in components
export const useEmployeePresence = (organizationId: string) => {
	const [employeePresence, setEmployeePresence] = useState<
		Record<string, PresenceState>
	>({});
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		let cleanupFn: () => void = () => {};

		const initPresence = async () => {
			try {
				setIsLoading(true);

				// Get all employees for the organization
				const employees = await EmployeesAPI.getAll(organizationId);

				// Initialize real-time presence system
				cleanupFn = await initializePresence(employees, user?.id);

				// Subscribe to presence updates
				const unsubscribe = subscribeToPresence((state) => {
					setEmployeePresence(state);
				});

				// Combine cleanup functions
				const originalCleanup = cleanupFn;
				cleanupFn = () => {
					unsubscribe();
					originalCleanup();
				};
			} catch (error) {
				console.error("Error initializing presence:", error);
				toast.error("Failed to initialize presence service");
			} finally {
				setIsLoading(false);
			}
		};

		if (organizationId) {
			initPresence();
		}

		return () => {
			cleanupFn();
		};
	}, [organizationId, user?.id]);

	return {
		presenceState: employeePresence,
		isLoading,
		getEmployeePresence: (employeeId: string): PresenceState | undefined =>
			employeePresence[employeeId],
		isEmployeeOnline: (employeeId: string): boolean =>
			employeePresence[employeeId]?.isOnline || false,
		getLastActive: (employeeId: string): string | undefined =>
			employeePresence[employeeId]?.lastActive,
	};
};

// Hook that extends useEmployeePresence with notification toggles
export const useEmployeePresenceWithNotifications = (
	organizationId: string
) => {
	const presenceService = useEmployeePresence(organizationId);
	const [initialized, setInitialized] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);

	useEffect(() => {
		// If not loading anymore, we're initialized
		if (!presenceService.isLoading) {
			setInitialized(true);
		}
	}, [presenceService.isLoading]);

	const toggleNotifications = () => {
		const newState = !notificationsEnabled;
		setNotificationsEnabled(newState);
		setStatusChangeNotifications(newState);
	};

	return {
		...presenceService,
		initialized,
		notificationsEnabled,
		toggleNotifications,
	};
};
