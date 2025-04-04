import { useEffect, useState, useCallback, useRef } from "react";
import { Employee, EmployeesAPI } from "@/api";
// import { supabase } from "./supabase"; // Removed Supabase import
import { toast } from "sonner";
import { useAuth } from "./auth";
import {
	ref,
	set,
	onValue,
	onDisconnect,
	serverTimestamp,
	off,
} from "firebase/database";
import { rtdb } from "./firebase"; // Import RTDB instance

// Real-time presence service configuration
// const PRESENCE_UPDATE_INTERVAL = 30000; // 30 seconds // Removed

// // Removed PresenceState interface and related variables
// interface PresenceState {
// 	employeeId: string;
// 	isOnline: boolean;
// 	lastActive: string;
// 	name?: string; // Add employee name for notifications
// }
//
// let presenceSubscribers: ((state: Record<string, PresenceState>) => void)[] =
// 	[];
// let presenceState: Record<string, PresenceState> = {};
// let notifyStatusChange = true; // Flag to control status change notifications
// let presenceChannel: any = null;

// // Removed initializePresence function
// export const initializePresence = async (
// 	employees: Employee[],
// 	userId: string | undefined
// ) => {
//   // ... Supabase related logic removed ...
// };

// // Removed subscribeToPresence function
// export const subscribeToPresence = (
// 	callback: (state: Record<string, PresenceState>) => void
// ) => {
//   // ... Supabase related logic removed ...
// };

// // Removed setStatusChangeNotifications function
// export const setStatusChangeNotifications = (enabled: boolean) => {
//   // ... Supabase related logic removed ...
// };

// // Removed useEmployeePresence hook
// export const useEmployeePresence = (organizationId: string) => {
//   // ... Supabase related logic removed ...
//   return {
//     // ... removed return values ...
//   };
// };

// // Removed useEmployeePresenceWithNotifications hook
// export const useEmployeePresenceWithNotifications = (
// 	organizationId: string
// ) => {
//   // ... Supabase related logic removed ...
//   return {
//     // ... removed return values ...
//   };
// };

// Keep necessary imports if other utility functions exist in this file, otherwise, the file might become empty.
// Currently leaving existing imports like react, api, toast, auth, etc.

// TODO: Review if this file is still needed or can be deleted entirely.
// TODO: Find and remove usages of useEmployeePresence and useEmployeePresenceWithNotifications hooks.

interface RtdbPresenceData {
	state: "online" | "offline";
	lastChanged: number | object; // Can be number (timestamp) or serverTimestamp object
	name?: string;
}

export interface PresenceState {
	employeeId: string;
	isOnline: boolean;
	lastActive: number; // Use number for timestamp
	name?: string;
}

let notifyStatusChange = true; // Flag to control status change notifications

// Helper to get a reference to the user's status path
const getUserStatusRef = (orgId: string, userId: string) => {
	return ref(rtdb, `/status/${orgId}/${userId}`);
};

// Helper to get a reference to the organization's status path
const getOrgStatusRef = (orgId: string) => {
	return ref(rtdb, `/status/${orgId}`);
};

// Set up presence for the current user
const setupPresenceTracking = (orgId: string, userId: string, name: string) => {
	const userStatusRef = getUserStatusRef(orgId, userId);

	// Use onValue to monitor connection state (Firebase specific)
	const connectedRef = ref(rtdb, ".info/connected");
	let connectedListener: (() => void) | null = null;

	connectedListener = onValue(connectedRef, (snap) => {
		if (snap.val() === true) {
			// We're connected (or reconnected). Set status to online.
			const presenceData: RtdbPresenceData = {
				state: "online",
				lastChanged: serverTimestamp(),
				name: name,
			};
			set(userStatusRef, presenceData);

			// When disconnected, set status to offline
			onDisconnect(userStatusRef).set({
				state: "offline",
				lastChanged: serverTimestamp(),
				name: name,
			});
		}
	});

	// Cleanup function to remove listener and potentially set offline status immediately
	return () => {
		if (connectedListener) {
			off(connectedRef, "value", connectedListener);
		}
		// Optionally, you could explicitly set offline here on cleanup,
		// but onDisconnect should handle most cases.
		// set(userStatusRef, { state: 'offline', lastChanged: serverTimestamp(), name: name });
		onDisconnect(userStatusRef).cancel(); // Don't forget to cancel onDisconnect
	};
};

// Enable or disable status change notifications
export const setStatusChangeNotifications = (enabled: boolean) => {
	notifyStatusChange = enabled;
};

// Hook to use employee presence in components
export const useEmployeePresenceWithNotifications = (
	organizationId: string | null // Allow null while org ID might be loading
) => {
	const { user } = useAuth();
	const [allPresence, setAllPresence] = useState<Record<string, PresenceState>>(
		{}
	);
	const [isLoading, setIsLoading] = useState(true);
	const [initialized, setInitialized] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] =
		useState<boolean>(true);
	const currentPresenceRef = useRef<Record<string, PresenceState>>(allPresence);

	// Update ref whenever state changes
	useEffect(() => {
		currentPresenceRef.current = allPresence;
	}, [allPresence]);

	useEffect(() => {
		if (!organizationId || !user?.uid) {
			setIsLoading(false);
			setInitialized(false); // Not initialized if no orgId or user
			setAllPresence({}); // Clear presence if org/user changes
			return;
		}

		setIsLoading(true);
		setInitialized(false);

		// Fetch employees first to get names (optional, could get from presence data)
		let employeesMap: Record<string, Employee> = {};
		const fetchEmployees = async () => {
			try {
				const employees = await EmployeesAPI.getAll(organizationId);
				employees.forEach((emp) => {
					employeesMap[emp.id] = emp;
				});
			} catch (err) {
				console.error("Error fetching employees for presence:", err);
			}
		};

		let presenceListener: (() => void) | null = null;
		let cleanupPresenceTracking: (() => void) | null = null;

		const initialize = async () => {
			await fetchEmployees(); // Wait for employee names

			// Setup presence for the current user
			const currentUserEmployee = employeesMap[user.uid];
			cleanupPresenceTracking = setupPresenceTracking(
				organizationId,
				user.uid,
				currentUserEmployee?.name || "Unknown User"
			);

			// Listen for presence changes across the organization
			const orgStatusRef = getOrgStatusRef(organizationId);
			presenceListener = onValue(orgStatusRef, (snapshot) => {
				const statusData = snapshot.val() as Record<
					string,
					RtdbPresenceData
				> | null;
				const newPresenceState: Record<string, PresenceState> = {};
				let initialLoad = !initialized; // Check if this is the first data load

				if (statusData) {
					Object.keys(statusData).forEach((employeeId) => {
						const data = statusData[employeeId];
						const isOnline = data.state === "online";
						const employeeName =
							data.name || employeesMap[employeeId]?.name || "Employee";

						// Get previous state for comparison
						const previousState = currentPresenceRef.current[employeeId];
						const wasOnline = previousState?.isOnline ?? false;

						newPresenceState[employeeId] = {
							employeeId,
							isOnline,
							lastActive:
								typeof data.lastChanged === "number"
									? data.lastChanged
									: Date.now(), // Handle server timestamp
							name: employeeName,
						};

						// --- Notification Logic --- //
						// Avoid notifications on initial load or if notifications are off
						if (initialLoad || !notifyStatusChange || employeeId === user.uid) {
							return;
						}

						if (isOnline && !wasOnline) {
							toast.success(`${employeeName} is now online`, {
								id: `login-${employeeId}`,
								duration: 3000,
							});
						} else if (!isOnline && wasOnline) {
							toast.info(`${employeeName} went offline`, {
								id: `logout-${employeeId}`,
								duration: 3000,
							});
						}
						// --- End Notification Logic --- //
					});
				}

				setAllPresence(newPresenceState);
				setIsLoading(false);
				setInitialized(true); // Mark as initialized after first data load
			});
		};

		initialize();

		// Cleanup function
		return () => {
			if (presenceListener && organizationId) {
				off(getOrgStatusRef(organizationId), "value", presenceListener);
			}
			if (cleanupPresenceTracking) {
				cleanupPresenceTracking();
			}
			setInitialized(false);
			setIsLoading(true); // Set loading true on cleanup/org change
		};
	}, [organizationId, user?.uid]); // Rerun if orgId or user changes

	const toggleNotifications = useCallback(() => {
		const newState = !notificationsEnabled;
		setNotificationsEnabled(newState);
		setStatusChangeNotifications(newState);
	}, [notificationsEnabled]);

	// Function to get presence for a specific employee
	const getEmployeePresence = useCallback(
		(employeeId: string): PresenceState | undefined => {
			return allPresence[employeeId];
		},
		[allPresence]
	);

	// Function to check if an employee is online
	const isEmployeeOnline = useCallback(
		(employeeId: string): boolean => {
			return allPresence[employeeId]?.isOnline || false;
		},
		[allPresence]
	);

	return {
		presenceState: allPresence,
		isLoading,
		initialized,
		notificationsEnabled,
		toggleNotifications,
		getEmployeePresence,
		isEmployeeOnline,
	};
};
