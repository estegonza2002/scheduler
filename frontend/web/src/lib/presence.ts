import { useEffect, useState } from "react";
import { Employee, EmployeesAPI } from "../api";
import { supabase } from "./supabase";
import { toast } from "sonner";

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

// Initialize the presence service
export const initializePresence = (employees: Employee[]) => {
	// Initialize presence state with all employees
	employees.forEach((employee) => {
		presenceState[employee.id] = {
			employeeId: employee.id,
			isOnline: employee.isOnline || false,
			lastActive: employee.lastActive || new Date().toISOString(),
			name: employee.name, // Store employee name for notifications
		};
	});

	// Start the simulation
	return simulateUserActivity();
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

// In a real app with Supabase, you would implement real-time presence like this:
// export const initializeRealPresence = async () => {
//   const presenceChannel = supabase.channel('presence');
//
//   presenceChannel
//     .on('presence', { event: 'sync' }, () => {
//       const state = presenceChannel.presenceState();
//       // Update state and notify subscribers
//     })
//     .on('presence', { event: 'join' }, ({ key, newPresences }) => {
//       // Handle user joining
//     })
//     .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
//       // Handle user leaving
//     })
//     .subscribe(async (status) => {
//       if (status === 'SUBSCRIBED') {
//         await presenceChannel.track({
//           user_id: currentUser.id,
//           online_at: new Date().toISOString()
//         });
//       }
//     });
//
//   return () => {
//     presenceChannel.unsubscribe();
//   };
// };

// Hook to use presence in components
export const useEmployeePresence = (organizationId: string) => {
	const [employeePresence, setEmployeePresence] = useState<
		Record<string, PresenceState>
	>({});
	const [initialized, setInitialized] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);

	useEffect(() => {
		if (!organizationId) return;

		let cleanup: (() => void) | undefined;

		const initPresence = async () => {
			try {
				// Fetch employees for the organization
				const employees = await EmployeesAPI.getAll(organizationId);

				// Initialize presence with these employees
				cleanup = initializePresence(employees);

				// Set notification preference
				setStatusChangeNotifications(notificationsEnabled);

				// Subscribe to presence changes
				const unsubscribe = subscribeToPresence((state) => {
					setEmployeePresence(state);
				});

				setInitialized(true);

				return () => {
					if (cleanup) cleanup();
					unsubscribe();
				};
			} catch (error) {
				console.error("Error initializing presence:", error);
			}
		};

		initPresence();

		return () => {
			if (cleanup) cleanup();
		};
	}, [organizationId, notificationsEnabled]);

	return {
		employeePresence,
		initialized,

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
