import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from "react";
import { Shift, Schedule } from "@/api/types";
import { ShiftsAPI } from "@/api";
import { supabase } from "./supabase";
import { toast } from "sonner";
import { getOrganizationId } from "./organization";

// Context type that includes all necessary functionality
interface ShiftContextType {
	// All schedules from the API
	schedules: Schedule[];
	// All shifts from the API (can be filtered by schedule)
	shifts: Shift[];
	// Current selected shift/schedule
	currentShift: Shift | null;
	// Loading state
	isLoading: boolean;
	// Refresh the shifts and schedules
	refreshShifts: () => Promise<void>;
	// Refresh shifts for a specific schedule
	refreshShiftsForSchedule: (scheduleId: string) => Promise<void>;
	// Get the current shift ID safely
	getCurrentShiftId: () => string | null;
	// Select a specific shift
	selectShift: (shiftId: string) => Promise<void>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: ReactNode }) {
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [currentShift, setCurrentShift] = useState<Shift | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch all schedules for the current organization
	const refreshShifts = async () => {
		try {
			setIsLoading(true);
			const organizationId = getOrganizationId();

			// First get all schedules
			const schedulesData = await ShiftsAPI.getAllSchedules(organizationId);
			setSchedules(schedulesData);

			// Then get shifts for the first schedule if available
			if (schedulesData.length > 0) {
				const firstScheduleId = schedulesData[0].id;
				const shiftsData = await ShiftsAPI.getShiftsForSchedule(
					firstScheduleId
				);
				setShifts(shiftsData);

				// Set the first shift as current if there's no current selection
				if (shiftsData.length > 0 && !currentShift) {
					setCurrentShift(shiftsData[0]);
				} else if (currentShift) {
					// Make sure current shift is updated with latest data
					const updated = shiftsData.find((s) => s.id === currentShift.id);
					if (updated) {
						setCurrentShift(updated);
					} else if (shiftsData.length > 0) {
						// If current shift no longer exists, select the first one
						setCurrentShift(shiftsData[0]);
					} else {
						setCurrentShift(null);
					}
				}
			}
		} catch (error) {
			console.error("Error fetching shifts and schedules:", error);
			toast.error("Failed to load schedules and shifts");
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch shifts for a specific schedule
	const refreshShiftsForSchedule = async (scheduleId: string) => {
		try {
			setIsLoading(true);
			const shiftsData = await ShiftsAPI.getShiftsForSchedule(scheduleId);
			setShifts(shiftsData);

			// Update current shift if it belongs to this schedule
			if (currentShift && currentShift.parent_shift_id === scheduleId) {
				const updated = shiftsData.find((s) => s.id === currentShift.id);
				if (updated) {
					setCurrentShift(updated);
				} else if (shiftsData.length > 0) {
					setCurrentShift(shiftsData[0]);
				} else {
					setCurrentShift(null);
				}
			} else if (shiftsData.length > 0) {
				setCurrentShift(shiftsData[0]);
			} else {
				setCurrentShift(null);
			}
		} catch (error) {
			console.error(`Error fetching shifts for schedule ${scheduleId}:`, error);
			toast.error("Failed to load shifts for the selected schedule");
		} finally {
			setIsLoading(false);
		}
	};

	// Get the current shift ID safely
	const getCurrentShiftId = (): string | null => {
		return currentShift ? currentShift.id : null;
	};

	// Select a specific shift
	const selectShift = async (shiftId: string) => {
		try {
			setIsLoading(true);
			const shift = await ShiftsAPI.getShiftById(shiftId);
			if (shift) {
				setCurrentShift(shift);

				// If this is a schedule, also load its shifts
				if (shift.is_schedule) {
					await refreshShiftsForSchedule(shift.id);
				}
			} else {
				toast.error("Shift not found");
			}
		} catch (error) {
			console.error(`Error selecting shift ${shiftId}:`, error);
			toast.error("Failed to select shift");
		} finally {
			setIsLoading(false);
		}
	};

	// Initial data fetch
	useEffect(() => {
		refreshShifts();
	}, []);

	// Set up real-time subscription for shift updates
	useEffect(() => {
		const organizationId = getOrganizationId();

		const subscription = supabase
			.channel("shift-updates")
			.on(
				"postgres_changes",
				{
					event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
					schema: "public",
					table: "shifts",
					filter: `organization_id=eq.${organizationId}`,
				},
				() => {
					refreshShifts();
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	// Context value
	const contextValue: ShiftContextType = {
		schedules,
		shifts,
		currentShift,
		isLoading,
		refreshShifts,
		refreshShiftsForSchedule,
		getCurrentShiftId,
		selectShift,
	};

	return (
		<ShiftContext.Provider value={contextValue}>
			{children}
		</ShiftContext.Provider>
	);
}

// Custom hook to use the shift context
export function useShift() {
	const context = useContext(ShiftContext);
	if (context === undefined) {
		throw new Error("useShift must be used within a ShiftProvider");
	}
	return context;
}

// Utility function to get shift ID (can be used in any context)
export function getShiftId(): string | null {
	try {
		// This will work in component contexts
		const { getCurrentShiftId } = useShift();
		return getCurrentShiftId();
	} catch (error) {
		// Return null if we're not in a component context
		console.warn("Unable to get shift ID - not in component context");
		return null;
	}
}
