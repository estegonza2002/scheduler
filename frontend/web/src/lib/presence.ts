import { useEffect, useState } from "react";
import { Employee, EmployeesAPI } from "@/api";
import { supabase } from "./supabase";
import { toast } from "sonner";
import { useAuth } from "./auth";

// Mock data for presence (in a real app, this would come from a real-time service)
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

// Simulated presence service
const simulateUserActivity = () => {
	const simulateInterval = setInterval(() => {
		// In a real app, this would be a real-time service like Supabase Presence
		// For now, we'll just randomly change some employees' statuses
		const allEmployeeIds = Object.keys(presenceState);

		if (allEmployeeIds.length === 0) return;

		// Randomly select employees to change status
		const employeesToUpdate = Math.floor(Math.random() * 3) + 1; // 1-3 employees

		for (let i = 0; i < employeesToUpdate; i++) {
			const randomIndex = Math.floor(Math.random() * allEmployeeIds.length);
			const employeeId = allEmployeeIds[randomIndex];

			// 30% chance of changing status
			if (Math.random() < 0.3) {
				const wasOnline = presenceState[employeeId].isOnline;
				const newStatus = !wasOnline;
				const employeeName =
					presenceState[employeeId].name || "Unknown employee";

				presenceState[employeeId] = {
					...presenceState[employeeId],
					isOnline: newStatus,
					lastActive: new Date().toISOString(),
				};

				// Show a notification if the status changed (if enabled)
				if (notifyStatusChange) {
					if (newStatus) {
						toast.success(`${employeeName} is now online`, {
							id: `login-${employeeId}`,
							duration: 3000,
						});
					} else {
						toast.info(`${employeeName} went offline`, {
							id: `logout-${employeeId}`,
							duration: 3000,
						});
					}
				}
			}
		}

		// Notify subscribers
		presenceSubscribers.forEach((callback) => callback({ ...presenceState }));
	}, PRESENCE_UPDATE_INTERVAL);

	return () => clearInterval(simulateInterval);
};

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
	const [initialized, setInitialized] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const { user } = useAuth();
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!organizationId) return;

		let cleanup: (() => void) | undefined;

		const initPresence = async () => {
			try {
				setInitialized(false);

				// Fetch employees for the organization
				const employees = await EmployeesAPI.getAll(organizationId);

				// Find the current user's employee record if possible
				const currentEmployeeId = user?.id; // Try to match by auth user ID

				// Initialize presence with these employees
				cleanup = await initializePresence(employees, currentEmployeeId);

				// Set notification preference
				setStatusChangeNotifications(notificationsEnabled);

				// Subscribe to presence changes
				const unsubscribe = subscribeToPresence((state) => {
					setEmployeePresence(state);
				});

				setInitialized(true);
				setError(null);

				return () => {
					if (cleanup) cleanup();
					unsubscribe();
				};
			} catch (error) {
				console.error("Error initializing presence:", error);
				setError(
					error instanceof Error
						? error
						: new Error("Failed to initialize presence")
				);
				// Still mark as initialized so UI doesn't get stuck
				setInitialized(true);
			}
		};

		initPresence();

		return () => {
			if (cleanup) cleanup();
		};
	}, [organizationId, notificationsEnabled, user]);

	return {
		employeePresence,
		initialized,
		error,

		// Get presence for a specific employee
		getEmployeePresence: (employeeId: string) =>
			employeePresence[employeeId] || {
				employeeId,
				isOnline: false,
				lastActive: undefined,
			},

		// Get all online employees
		getOnlineEmployees: () =>
			Object.values(employeePresence).filter((p) => p.isOnline),

		// Toggle notifications
		toggleNotifications: () => {
			const newValue = !notificationsEnabled;
			setNotificationsEnabled(newValue);
			setStatusChangeNotifications(newValue);
			return newValue;
		},

		// Get notification status
		notificationsEnabled,
	};
};
