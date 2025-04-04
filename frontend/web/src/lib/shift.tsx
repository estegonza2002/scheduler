import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
	useCallback,
} from "react";
import { Shift, Schedule } from "@/api/types";
import { ShiftsAPI } from "@/api";
import { toast } from "sonner";
import { useOrganization } from "./organization";

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
	// Get organization context
	const { getCurrentOrganizationId, isLoading: isOrgLoading } =
		useOrganization();
	// Get the organization ID once
	const organizationId = getCurrentOrganizationId();

	// Fetch all schedules for the current organization
	const refreshShifts = useCallback(async () => {
		// Wait until organization is loaded and ID is available
		if (isOrgLoading || !organizationId) {
			console.log(
				"ShiftProvider: Waiting for organization ID or organization is loading..."
			);
			// Clear shifts/schedules if org is not available and not loading
			if (!isOrgLoading) {
				setSchedules([]);
				setShifts([]);
				setCurrentShift(null);
				setIsLoading(false);
			}
			return;
		}

		try {
			// Set loading only when we are sure we can fetch
			setIsLoading(true);
			console.log(
				`ShiftProvider: Fetching schedules for organization: ${organizationId}`
			);

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
	}, [
		isOrgLoading,
		organizationId,
		currentShift,
		setSchedules,
		setShifts,
		setIsLoading,
	]);

	// Fetch shifts for a specific schedule
	const refreshShiftsForSchedule = useCallback(
		async (scheduleId: string) => {
			// Use the organizationId retrieved in the component scope
			if (!organizationId) return;
			setIsLoading(true);
			try {
				// Use the correct method to get shifts for a specific schedule
				const fetchedShifts = await ShiftsAPI.getShiftsForSchedule(scheduleId);
				setShifts(fetchedShifts || []);
				toast.success(`Shifts refreshed for schedule ${scheduleId}`);
			} catch (error) {
				console.error("Error refreshing shifts for schedule:", error);
				toast.error("Failed to refresh shifts for schedule");
			} finally {
				setIsLoading(false);
			}
		},
		[organizationId, setIsLoading, setShifts]
	);

	// Get the current shift ID safely
	const getCurrentShiftId = (): string | null => {
		return currentShift ? currentShift.id : null;
	};

	// Select a specific shift
	const selectShift = async (shiftId: string) => {
		setIsLoading(true);
		try {
			const selected = await ShiftsAPI.getShiftById(shiftId);
			setCurrentShift(selected);
			// Check if it's a schedule (parent shift)
			if (selected && selected.isSchedule) {
				// If it's a schedule, load its child shifts
				await refreshShiftsForSchedule(shiftId);
			}
			toast.info(`Selected shift: ${selected?.name || shiftId}`);
		} catch (error) {
			console.error(`Error selecting shift ${shiftId}:`, error);
			toast.error("Failed to select shift");
			setCurrentShift(null);
		} finally {
			setIsLoading(false);
		}
	};

	// Effect to load initial shifts and schedules when organizationId is available
	useEffect(() => {
		// Use the organizationId retrieved in the component scope
		if (organizationId) {
			refreshShifts();
		}
	}, [organizationId, refreshShifts]);

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
export function getCurrentShift(): string | null {
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
