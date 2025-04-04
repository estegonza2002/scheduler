import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { format, parseISO } from "date-fns";
import { db, auth } from "../../lib/firebase"; // Assuming initialized firebase instances
import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	doc,
	addDoc,
	updateDoc,
	setDoc, // Import setDoc for creating/overwriting user profiles
	serverTimestamp,
	Timestamp, // Import Timestamp
	deleteDoc,
	DocumentSnapshot, // Add DocumentSnapshot import
	orderBy,
	writeBatch,
	QueryConstraint,
} from "firebase/firestore";
import {
	Employee,
	Location,
	Notification,
	Organization,
	Schedule,
	Shift,
	ShiftAssignment,
	ShiftTask,
	ScheduleCreateInput,
	ShiftItemCreateInput,
	ShiftCreateInput,
	Subscription,
	PaymentMethod,
	Invoice,
	SubscriptionUpdateParams,
	CheckoutSession,
	SubscriptionPlan,
	UserProfile, // Import UserProfile type
} from "../types"; // Import from main types file

// Helper function to convert Firestore data (with Timestamps) to Organization type
const mapDocToOrganization = (docData: any, id: string): Organization => {
	// Ensure timestamps are handled correctly (e.g., converted to ISO strings)
	const createdAt =
		docData.createdAt instanceof Timestamp
			? docData.createdAt.toDate().toISOString()
			: docData.createdAt;
	const updatedAt =
		docData.updatedAt instanceof Timestamp
			? docData.updatedAt.toDate().toISOString()
			: docData.updatedAt;

	// Map other fields, handling potential undefined values and camelCase
	return {
		id: id,
		name: docData.name || "",
		description: docData.description || undefined,
		logoUrl: docData.logoUrl || undefined,
		ownerId: docData.ownerId || "", // Keep ownerId for now, might refactor later
		createdAt: createdAt,
		updatedAt: updatedAt,
		// Add other fields from Firestore schema as needed by Organization type
		address: docData.address || undefined,
		contactEmail: docData.contactEmail || undefined,
		contactPhone: docData.contactPhone || undefined,
		website: docData.website || undefined,
		businessHours: docData.businessHours || undefined,
		stripeCustomerId: docData.stripeCustomerId || undefined,
		subscriptionId: docData.subscriptionId || undefined,
		subscriptionStatus: docData.subscriptionStatus || undefined,
		subscriptionPlan: docData.subscriptionPlan || undefined,
	};
};

// Organizations API - Refactored for Firestore
export const OrganizationsAPI = {
	getAll: async (): Promise<Organization[]> => {
		const user = auth.currentUser;
		if (!user) {
			console.log("No authenticated user found.");
			toast.error("Authentication required to fetch organizations.");
			return [];
		}

		try {
			console.log(`Fetching organization memberships for user: ${user.uid}`);
			// 1. Find organization IDs the user is a member of
			const membersRef = collection(db, "organizationMembers");
			const qMembers = query(membersRef, where("userId", "==", user.uid));
			const memberSnapshots = await getDocs(qMembers);

			const organizationIds = memberSnapshots.docs.map(
				(doc) => doc.data().organizationId as string
			);

			if (organizationIds.length === 0) {
				console.log("User is not a member of any organizations.");
				return [];
			}

			console.log(
				`Found ${organizationIds.length} organizations for user:`,
				organizationIds
			);

			// 2. Fetch the actual organization documents
			// Firestore 'in' query supports up to 30 items in the array as of current limits.
			// If more are needed, fetch in batches or reconsider schema/query.
			if (organizationIds.length > 30) {
				// Handle fetching in batches if necessary (simplified for now)
				console.warn("Fetching more than 30 organizations, consider batching.");
				// For simplicity, fetch all for now, but be aware of limitations.
			}

			const orgsRef = collection(db, "organizations");
			const qOrgs = query(orgsRef, where("__name__", "in", organizationIds)); // Query by document ID
			const orgSnapshots = await getDocs(qOrgs);

			const organizations = orgSnapshots.docs.map((docSnap) =>
				mapDocToOrganization(docSnap.data(), docSnap.id)
			);

			console.log(
				`Successfully fetched ${organizations.length} organizations.`
			);
			return organizations;
		} catch (error) {
			console.error("Error fetching organizations from Firestore:", error);
			toast.error(
				`Failed to fetch organizations: ${
					error instanceof Error ? error.message : "Unknown Firestore error"
				}`
			);
			return [];
		}
	},

	getById: async (id: string): Promise<Organization | null> => {
		if (!id) {
			console.error("getById called with no ID.");
			return null;
		}
		try {
			const orgRef = doc(db, "organizations", id);
			const docSnap = await getDoc(orgRef);

			if (!docSnap.exists()) {
				toast.error("Organization not found.");
				console.log(`Organization with ID ${id} not found.`);
				return null;
			}

			return mapDocToOrganization(docSnap.data(), docSnap.id);
		} catch (error) {
			console.error("Error fetching organization by ID:", error);
			toast.error("Failed to fetch organization details.");
			return null;
		}
	},

	create: async (
		data: Pick<Organization, "name" | "description"> // Adjust input type
	): Promise<Organization | null> => {
		// Return null on failure
		const user = auth.currentUser;
		if (!user) {
			toast.error("You must be logged in to create an organization.");
			return null;
		}

		try {
			// 1. Add the organization document
			const orgsRef = collection(db, "organizations");
			const newOrgData = {
				...data,
				ownerId: user.uid, // Set owner ID
				createdAt: serverTimestamp(), // Use server timestamp
				updatedAt: serverTimestamp(),
				// Initialize other fields based on schema or leave empty
				address: {}, // Example: Initialize address map
			};
			const docRef = await addDoc(orgsRef, newOrgData);
			console.log("Organization created with ID:", docRef.id);

			// 2. Add the creator as an 'owner' in organizationMembers
			const membersRef = collection(db, "organizationMembers");
			await addDoc(membersRef, {
				organizationId: docRef.id,
				userId: user.uid,
				role: "owner", // Or "admin" depending on desired default role
				status: "active",
				joinedAt: serverTimestamp(),
			});
			console.log(`Added user ${user.uid} as owner/admin to org ${docRef.id}`);

			// 3. Fetch the newly created org data to return (including timestamps)
			const newOrgSnap = await getDoc(docRef);
			if (!newOrgSnap.exists()) {
				// Should not happen, but handle defensively
				throw new Error("Failed to fetch newly created organization");
			}

			toast.success("Organization created successfully!");
			return mapDocToOrganization(newOrgSnap.data(), newOrgSnap.id);
		} catch (error) {
			console.error("Error creating organization in Firestore:", error);
			toast.error(
				`Failed to create organization: ${
					error instanceof Error ? error.message : "Unknown Firestore error"
				}`
			);
			// Don't re-throw, return null to indicate failure
			return null;
		}
	},

	update: async (
		organization: Partial<Omit<Organization, "id" | "createdAt">> & {
			id: string;
		} // Exclude non-updatable fields
	): Promise<Organization | null> => {
		const { id, ...updateData } = organization; // Separate ID from data

		if (!id) {
			console.error("Update called without an organization ID.");
			toast.error("Organization ID missing for update.");
			return null;
		}

		try {
			const orgRef = doc(db, "organizations", id);
			const dataToUpdate = {
				...updateData,
				updatedAt: serverTimestamp(), // Always update the timestamp
			};

			await updateDoc(orgRef, dataToUpdate);

			// Fetch the updated document to return it
			const updatedDocSnap = await getDoc(orgRef);
			if (!updatedDocSnap.exists()) {
				// Should not happen after successful update
				throw new Error("Failed to fetch updated organization data.");
			}

			toast.success("Organization updated successfully!");
			return mapDocToOrganization(updatedDocSnap.data(), updatedDocSnap.id);
		} catch (error) {
			console.error("Error updating organization:", error);
			toast.error("Failed to update organization.");
			return null;
		}
	},
};

// User Profile API (New)
export const UserAPI = {
	getProfile: async (userId: string): Promise<UserProfile | null> => {
		if (!userId) {
			console.error("getProfile called without userId.");
			return null;
		}
		try {
			const userRef = doc(db, "users", userId);
			const docSnap = await getDoc(userRef);
			if (docSnap.exists()) {
				// Map Firestore data to UserProfile type
				const data = docSnap.data();
				return {
					id: userId,
					email: data.email,
					displayName: data.displayName,
					photoURL: data.photoURL,
					currentOrganizationId: data.currentOrganizationId,
					createdAt:
						data.createdAt instanceof Timestamp
							? data.createdAt.toDate().toISOString()
							: data.createdAt,
					updatedAt:
						data.updatedAt instanceof Timestamp
							? data.updatedAt.toDate().toISOString()
							: data.updatedAt,
				};
			} else {
				console.log(`No user profile found for userId: ${userId}`);
				return null;
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
			toast.error("Failed to load user profile.");
			return null;
		}
	},

	updateProfile: async (
		userId: string,
		data: Partial<Omit<UserProfile, "id" | "createdAt">>
	): Promise<boolean> => {
		if (!userId) {
			console.error("updateProfile called without userId.");
			toast.error("Cannot update profile: User ID is missing.");
			return false;
		}
		try {
			const userRef = doc(db, "users", userId);
			// Use setDoc with merge: true to create or update the profile document
			await setDoc(
				userRef,
				{
					...data,
					updatedAt: serverTimestamp(), // Keep track of the last update
				},
				{ merge: true }
			);
			console.log(`User profile updated for userId: ${userId}`);
			// No toast message here, as it might be called frequently
			return true;
		} catch (error) {
			console.error("Error updating user profile:", error);
			toast.error("Failed to update user profile.");
			return false;
		}
	},

	// Optional: Function to create profile initially if needed (e.g., during signup)
	createProfile: async (
		userId: string,
		data: Omit<UserProfile, "id" | "createdAt" | "updatedAt">
	): Promise<boolean> => {
		if (!userId) {
			console.error("createProfile called without userId.");
			return false;
		}
		try {
			const userRef = doc(db, "users", userId);
			await setDoc(userRef, {
				...data,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
			console.log(`User profile created for userId: ${userId}`);
			return true;
		} catch (error) {
			console.error("Error creating user profile:", error);
			toast.error("Failed to initialize user profile.");
			return false;
		}
	},
};

// Organization Members API (New)
export const OrganizationMembersAPI = {
	// Fetches all member entries for a given organization
	getAllByOrgId: async (organizationId: string): Promise<any[]> => {
		// Return type needs refinement
		if (!organizationId) {
			console.error("getAllByOrgId called without organizationId.");
			return [];
		}
		try {
			const membersRef = collection(db, "organizationMembers");
			const q = query(
				membersRef,
				where("organizationId", "==", organizationId)
			);
			const querySnapshot = await getDocs(q);
			// Return documents with their IDs
			return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		} catch (error) {
			console.error("Error fetching organization members:", error);
			toast.error("Failed to load team members.");
			return [];
		}
	},

	// Updates the role of a specific member entry by its document ID
	updateRole: async (
		memberDocId: string,
		role: "admin" | "member" | "owner"
	): Promise<boolean> => {
		if (!memberDocId) {
			console.error("updateRole called without memberDocId.");
			toast.error("Cannot update role: Member ID missing.");
			return false;
		}
		try {
			const memberRef = doc(db, "organizationMembers", memberDocId);
			await updateDoc(memberRef, {
				role: role,
				updatedAt: serverTimestamp(), // Keep track of updates
			});
			console.log(`Updated role for member ${memberDocId} to ${role}`);
			toast.success(`User role updated to ${role}.`);
			return true;
		} catch (error) {
			console.error("Error updating member role:", error);
			toast.error("Failed to update user role.");
			return false;
		}
	},

	// Checks if a user is already a member of an organization
	getByUserIdAndOrgId: async (
		userId: string,
		organizationId: string
	): Promise<any | null> => {
		if (!userId || !organizationId) {
			console.error(
				"getByUserIdAndOrgId called without userId or organizationId."
			);
			return null;
		}
		try {
			const membersRef = collection(db, "organizationMembers");
			const q = query(
				membersRef,
				where("userId", "==", userId),
				where("organizationId", "==", organizationId)
			);
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				return null; // Not a member
			}
			// Return the first match (should only be one)
			const docSnap = querySnapshot.docs[0];
			return { id: docSnap.id, ...docSnap.data() };
		} catch (error) {
			console.error("Error checking organization membership:", error);
			// Don't toast here, might be expected check
			return null;
		}
	},

	// TODO: Implement inviteUser (potentially requires Cloud Function)
	// For now, this will add a member document with a 'pending' status.
	inviteUser: async (
		organizationId: string,
		email: string,
		role: "admin" | "member",
		invitedByUserId: string
	): Promise<any | null> => {
		if (!organizationId || !email || !role || !invitedByUserId) {
			console.error("inviteUser called with missing parameters.");
			toast.error("Missing information required to send invitation.");
			return null;
		}

		try {
			// 1. Check if email already exists in this organization (pending or active)
			const membersRef = collection(db, "organizationMembers");
			const q = query(
				membersRef,
				where("organizationId", "==", organizationId),
				where("email", "==", email)
			);
			const existingSnapshot = await getDocs(q);

			if (!existingSnapshot.empty) {
				// Could check status here - e.g., resend if pending, error if active
				const existingDoc = existingSnapshot.docs[0].data();
				if (existingDoc.status === "pending") {
					// TODO: Implement resend logic if needed (e.g., update timestamp)
					toast.info(
						`An invitation is already pending for ${email}. Resend functionality not yet implemented.`
					);
				} else {
					toast.error(
						`${email} is already an active member of this organization.`
					);
				}
				return null;
			}

			// 2. Add a new member document with 'pending' status
			const newMemberData = {
				organizationId: organizationId,
				email: email, // Store email for lookup before user accepts
				role: role,
				invitedByUserId: invitedByUserId,
				status: "pending" as const, // Explicitly set status
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				userId: null, // userId will be added when the user accepts the invite
			};

			const docRef = await addDoc(membersRef, newMemberData);
			console.log("Pending member document created with ID:", docRef.id);

			// 3. TODO: Trigger Cloud Function to send invite email
			console.warn(
				"TODO: Trigger Cloud Function or email service to send actual invitation email."
			);

			// Return the data of the newly created pending member entry
			// Combine the ID with the data for the return object
			// Fetch the created doc to get the server timestamp correctly resolved (optional but safer)
			const newDocSnap = await getDoc(docRef);
			if (!newDocSnap.exists()) {
				throw new Error("Failed to fetch newly created member document.");
			}
			const createdData = newDocSnap.data();
			const newMember = {
				id: newDocSnap.id,
				...createdData,
				// Convert Timestamps to ISO strings for consistency if needed, or handle Timestamp objects
				createdAt:
					createdData.createdAt instanceof Timestamp
						? createdData.createdAt.toDate().toISOString()
						: new Date().toISOString(),
				updatedAt:
					createdData.updatedAt instanceof Timestamp
						? createdData.updatedAt.toDate().toISOString()
						: new Date().toISOString(),
			} as any; // Cast to OrganizationMember type

			toast.success(`Invitation record created for ${email}.`);
			return newMember;
		} catch (error) {
			console.error("Error inviting user:", error);
			toast.error(`Failed to send invitation to ${email}.`);
			return null;
		}
	},

	// Removes a member entry by its document ID
	removeMember: async (memberDocId: string): Promise<boolean> => {
		if (!memberDocId) {
			console.error("removeMember called without memberDocId.");
			toast.error("Cannot remove member: Member ID missing.");
			return false;
		}
		try {
			const memberRef = doc(db, "organizationMembers", memberDocId);
			await deleteDoc(memberRef); // Use deleteDoc
			console.log(`Removed member ${memberDocId}`);
			toast.success("User removed from organization.");
			return true;
		} catch (error) {
			console.error("Error removing member:", error);
			toast.error("Failed to remove user.");
			return false;
		}
	},
};

// Helper function to map Firestore doc data to Shift/Schedule type
const mapDocToShift = (docSnap: DocumentSnapshot): Shift => {
	const data = docSnap.data() as any; // Use 'any' for flexibility, ensure fields exist
	const shift: Shift = {
		id: docSnap.id,
		organizationId: data.organizationId,
		name: data.name,
		description: data.description,
		status: data.status,
		isSchedule: data.isSchedule,
		userId: data.userId,
		createdBy: data.createdBy,
		locationId: data.locationId,
		parentShiftId: data.parentShiftId,
		// Convert Timestamps to ISO strings
		startTime:
			data.startTime instanceof Timestamp
				? data.startTime.toDate().toISOString()
				: data.startTime,
		endTime:
			data.endTime instanceof Timestamp
				? data.endTime.toDate().toISOString()
				: data.endTime,
		createdAt:
			data.createdAt instanceof Timestamp
				? data.createdAt.toDate().toISOString()
				: data.createdAt,
		updatedAt:
			data.updatedAt instanceof Timestamp
				? data.updatedAt.toDate().toISOString()
				: data.updatedAt,
		// Map task arrays if they exist
		checkInTasks: data.checkInTasks || [],
		checkOutTasks: data.checkOutTasks || [],
	};
	return shift;
};

// Shifts API (Refactored for Firestore)
export const ShiftsAPI = {
	// Schedule methods
	getAllSchedules: async (organizationId?: string): Promise<Schedule[]> => {
		if (!organizationId) {
			console.error("getAllSchedules called without organizationId.");
			return [];
		}
		try {
			const shiftsRef = collection(db, "shifts");
			const q = query(
				shiftsRef,
				where("organizationId", "==", organizationId),
				where("isSchedule", "==", true)
			);
			const querySnapshot = await getDocs(q);
			const schedules: Schedule[] = [];
			querySnapshot.forEach((docSnap) => {
				schedules.push(mapDocToShift(docSnap) as Schedule); // Cast to Schedule
			});
			return schedules;
		} catch (error) {
			console.error("Error fetching schedules:", error);
			return [];
		}
	},

	// Get regular shifts (not schedules)
	getRegularShifts: async (organizationId?: string): Promise<Shift[]> => {
		if (!organizationId) {
			console.error("getRegularShifts called without organizationId.");
			return [];
		}
		try {
			const shiftsRef = collection(db, "shifts");
			const q = query(
				shiftsRef,
				where("organizationId", "==", organizationId),
				where("isSchedule", "==", false)
			);
			const querySnapshot = await getDocs(q);
			const shifts: Shift[] = [];
			querySnapshot.forEach((docSnap) => {
				shifts.push(mapDocToShift(docSnap));
			});
			return shifts;
		} catch (error) {
			console.error("Error fetching regular shifts:", error);
			return [];
		}
	},

	getScheduleById: async (id: string): Promise<Schedule | null> => {
		if (!id) return null;
		try {
			const shiftRef = doc(db, "shifts", id);
			const docSnap = await getDoc(shiftRef);
			if (docSnap.exists()) {
				const shift = mapDocToShift(docSnap);
				if (shift.isSchedule) {
					return shift as Schedule;
				}
			}
			console.log(`Schedule with id ${id} not found or is not a schedule.`);
			return null;
		} catch (error) {
			console.error(`Error fetching schedule ${id}:`, error);
			return null;
		}
	},

	createSchedule: async (
		data: ScheduleCreateInput
	): Promise<Schedule | null> => {
		if (!data.organizationId) {
			console.error("createSchedule called without organizationId.");
			toast.error("Organization ID missing.");
			return null;
		}
		try {
			const newScheduleData = {
				...data,
				isSchedule: true,
				// Convert ISO strings back to Timestamps for Firestore if needed, or store as strings
				startTime: Timestamp.fromDate(parseISO(data.startTime)),
				endTime: Timestamp.fromDate(parseISO(data.endTime)),
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				// Ensure task arrays are initialized if not provided
				checkInTasks: data.checkInTasks || [],
				checkOutTasks: data.checkOutTasks || [],
			};
			const docRef = await addDoc(collection(db, "shifts"), newScheduleData);
			const newDocSnap = await getDoc(docRef);

			if (!newDocSnap.exists()) {
				throw new Error("Failed to fetch newly created schedule.");
			}
			toast.success("Schedule created successfully!");
			return mapDocToShift(newDocSnap) as Schedule;
		} catch (error) {
			console.error("Error creating schedule:", error);
			toast.error("Failed to create schedule.");
			return null;
		}
	},

	// Shift methods
	getShiftsForSchedule: async (parentShiftId: string): Promise<Shift[]> => {
		if (!parentShiftId) return [];
		try {
			const shiftsRef = collection(db, "shifts");
			const q = query(
				shiftsRef,
				where("parentShiftId", "==", parentShiftId),
				where("isSchedule", "==", false)
			);
			const querySnapshot = await getDocs(q);
			const shifts: Shift[] = [];
			querySnapshot.forEach((docSnap) => {
				shifts.push(mapDocToShift(docSnap));
			});
			return shifts;
		} catch (error) {
			console.error(
				`Error fetching shifts for schedule ${parentShiftId}:`,
				error
			);
			return [];
		}
	},

	getShiftById: async (id: string): Promise<Shift | null> => {
		if (!id) return null;
		try {
			const shiftRef = doc(db, "shifts", id);
			const docSnap = await getDoc(shiftRef);
			if (docSnap.exists()) {
				return mapDocToShift(docSnap);
			}
			console.log(`Shift with id ${id} not found.`);
			return null;
		} catch (error) {
			console.error(`Error fetching shift ${id}:`, error);
			return null;
		}
	},

	createShift: async (data: ShiftItemCreateInput): Promise<Shift | null> => {
		if (!data.organizationId) {
			console.error("createShift called without organizationId.");
			toast.error("Organization ID missing.");
			return null;
		}
		if (!data.status) {
			console.error("createShift called without status.");
			toast.error("Shift status is required.");
			return null;
		}
		try {
			const newShiftData = {
				...data,
				isSchedule: false,
				status: data.status, // Already required in type
				// Convert ISO strings back to Timestamps for Firestore
				startTime: Timestamp.fromDate(parseISO(data.startTime)),
				endTime: Timestamp.fromDate(parseISO(data.endTime)),
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				checkInTasks: data.checkInTasks || [],
				checkOutTasks: data.checkOutTasks || [],
			};
			const docRef = await addDoc(collection(db, "shifts"), newShiftData);
			const newDocSnap = await getDoc(docRef);
			if (!newDocSnap.exists()) {
				throw new Error("Failed to fetch newly created shift.");
			}
			toast.success("Shift created successfully!");
			return mapDocToShift(newDocSnap);
		} catch (error) {
			console.error("Error creating shift:", error);
			toast.error("Failed to create shift.");
			return null;
		}
	},

	// General methods for both shifts and schedules
	updateShift: async (
		id: string,
		data: Partial<ShiftCreateInput> // Allow partial updates
	): Promise<Shift | null> => {
		if (!id) {
			console.error("updateShift called without id.");
			toast.error("Shift ID missing for update.");
			return null;
		}
		try {
			const shiftRef = doc(db, "shifts", id);
			// Convert date strings to Timestamps if they are present in the update data
			const updatePayload: Record<string, any> = { ...data };
			if (data.startTime) {
				updatePayload.startTime = Timestamp.fromDate(parseISO(data.startTime));
			}
			if (data.endTime) {
				updatePayload.endTime = Timestamp.fromDate(parseISO(data.endTime));
			}

			const updateData = {
				...updatePayload,
				updatedAt: serverTimestamp(),
			};

			await updateDoc(shiftRef, updateData);
			const updatedDocSnap = await getDoc(shiftRef);
			if (!updatedDocSnap.exists()) {
				throw new Error("Failed to fetch updated shift/schedule data.");
			}
			const updatedShift = mapDocToShift(updatedDocSnap);
			toast.success(
				`${
					updatedShift.isSchedule ? "Schedule" : "Shift"
				} updated successfully!`
			);
			return updatedShift;
		} catch (error) {
			console.error(`Error updating shift/schedule ${id}:`, error);
			toast.error("Failed to update shift/schedule.");
			return null;
		}
	},

	deleteShift: async (id: string): Promise<boolean> => {
		if (!id) {
			console.error("deleteShift called without id.");
			toast.error("Shift ID missing for deletion.");
			return false;
		}
		try {
			const shiftRef = doc(db, "shifts", id);
			// TODO: Consider deleting child shifts if deleting a schedule?
			await deleteDoc(shiftRef);
			toast.success("Shift/Schedule deleted successfully!");
			return true;
		} catch (error) {
			console.error(`Error deleting shift/schedule ${id}:`, error);
			toast.error("Failed to delete shift/schedule.");
			return false;
		}
	},

	// Get all shifts for a specific location
	getShiftsByLocationId: async (locationId: string): Promise<Shift[]> => {
		if (!locationId) return [];
		try {
			const shiftsRef = collection(db, "shifts");
			const q = query(
				shiftsRef,
				where("locationId", "==", locationId),
				where("isSchedule", "==", false)
			);
			const querySnapshot = await getDocs(q);
			const shifts: Shift[] = [];
			querySnapshot.forEach((docSnap) => {
				shifts.push(mapDocToShift(docSnap));
			});
			return shifts;
		} catch (error) {
			console.error(`Error fetching shifts for location ${locationId}:`, error);
			return [];
		}
	},

	// Additional methods as needed...
};

// Locations API (Refactored for Firestore)
export const LocationsAPI = {
	getAll: async (organizationId?: string): Promise<Location[]> => {
		if (!organizationId) {
			console.error("getAll locations called without organizationId.");
			toast.error("Organization ID is required to fetch locations.");
			return [];
		}
		try {
			console.log("Fetching locations for organizationId:", organizationId);
			const locationsRef = collection(db, "locations");
			const q = query(
				locationsRef,
				where("organizationId", "==", organizationId)
			);
			const querySnapshot = await getDocs(q);

			const locations: Location[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				locations.push({
					id: doc.id,
					organizationId: data.organizationId,
					name: data.name,
					address: data.address,
					city: data.city,
					state: data.state,
					zipCode: data.zipCode,
					isActive: data.isActive,
					latitude: data.latitude,
					longitude: data.longitude,
					imageUrl: data.imageUrl,
					// Add timestamps if they exist in your Firestore schema
					// createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
					// updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
				});
			});
			console.log(`Fetched ${locations.length} locations.`);
			return locations;
		} catch (error) {
			console.error("Error fetching locations:", error);
			return [];
		}
	},

	getById: async (id: string): Promise<Location | null> => {
		if (!id) {
			console.error("getById called without id.");
			return null;
		}
		try {
			const locationRef = doc(db, "locations", id);
			const docSnap = await getDoc(locationRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				return {
					id: docSnap.id,
					organizationId: data.organizationId,
					name: data.name,
					address: data.address,
					city: data.city,
					state: data.state,
					zipCode: data.zipCode,
					isActive: data.isActive,
					latitude: data.latitude,
					longitude: data.longitude,
					imageUrl: data.imageUrl,
					// Add timestamps if needed
					// createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
					// updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
				};
			} else {
				console.log(`Location with id ${id} not found.`);
				toast.error("Location not found.");
				return null;
			}
		} catch (error) {
			console.error(`Error fetching location ${id}:`, error);
			toast.error("Failed to fetch location details.");
			return null;
		}
	},

	create: async (data: Omit<Location, "id">): Promise<Location | null> => {
		if (!data.organizationId) {
			console.error("Cannot create location without organizationId");
			toast.error("Organization ID is missing.");
			return null;
		}
		try {
			// Prepare data for Firestore using Location properties
			const locationData = {
				...data,
				name: data.name || "New Location",
				isActive: data.isActive === undefined ? true : data.isActive,
				// Add relevant default fields for Location if needed
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			};

			const docRef = await addDoc(collection(db, "locations"), locationData);
			console.log("Location created with ID:", docRef.id);

			// Fetch the created document
			const newDocSnap = await getDoc(docRef);
			if (!newDocSnap.exists()) {
				throw new Error("Failed to fetch newly created location document.");
			}
			const createdData = newDocSnap.data();

			// Construct the return object explicitly using Location type
			const newLocation: Location = {
				id: newDocSnap.id,
				organizationId: createdData.organizationId,
				name: createdData.name,
				address: createdData.address,
				city: createdData.city,
				state: createdData.state,
				zipCode: createdData.zipCode,
				isActive: createdData.isActive,
				latitude: createdData.latitude,
				longitude: createdData.longitude,
				imageUrl: createdData.imageUrl,
				// Timestamps removed to match Location type definition
				// createdAt: createdData.createdAt instanceof Timestamp ? createdData.createdAt.toDate().toISOString() : undefined,
				// updatedAt: createdData.updatedAt instanceof Timestamp ? createdData.updatedAt.toDate().toISOString() : undefined,
			};

			toast.success("Location created successfully!");
			return newLocation;
		} catch (error) {
			console.error("Error creating location:", error);
			toast.error("Failed to create location.");
			return null;
		}
	},

	update: async (
		id: string,
		data: Partial<Omit<Location, "id" | "createdAt" | "organizationId">>
	): Promise<Location | null> => {
		if (!id) {
			console.error("update location called without id.");
			toast.error("Cannot update location: ID is missing.");
			return null;
		}
		try {
			const locationRef = doc(db, "locations", id);
			const updateData = {
				...data, // Spread the partial update data
				updatedAt: serverTimestamp(), // Always update the timestamp
			};
			await updateDoc(locationRef, updateData);
			console.log(`Location ${id} updated.`);

			// Fetch and return the updated document
			const updatedDocSnap = await getDoc(locationRef);
			if (!updatedDocSnap.exists()) {
				throw new Error("Failed to fetch updated location document.");
			}
			const updatedData = updatedDocSnap.data();

			// Construct the return object explicitly using Location type
			const updatedLocation: Location = {
				id: updatedDocSnap.id,
				organizationId: updatedData.organizationId,
				name: updatedData.name,
				address: updatedData.address,
				city: updatedData.city,
				state: updatedData.state,
				zipCode: updatedData.zipCode,
				isActive: updatedData.isActive,
				latitude: updatedData.latitude,
				longitude: updatedData.longitude,
				imageUrl: updatedData.imageUrl,
				// Timestamps removed to match Location type definition
				// createdAt: updatedData.createdAt instanceof Timestamp ? updatedData.createdAt.toDate().toISOString() : updatedData.createdAt,
				// updatedAt: updatedData.updatedAt instanceof Timestamp ? updatedData.updatedAt.toDate().toISOString() : undefined,
			};

			toast.success("Location updated successfully!");
			return updatedLocation;
		} catch (error) {
			console.error(`Error updating location ${id}:`, error);
			toast.error("Failed to update location.");
			return null;
		}
	},

	// Add delete method
	delete: async (id: string): Promise<boolean> => {
		if (!id) {
			console.error("delete location called without id.");
			toast.error("Cannot delete location: ID is missing.");
			return false;
		}
		try {
			const locationRef = doc(db, "locations", id);
			await deleteDoc(locationRef);
			console.log(`Location ${id} deleted.`);
			toast.success("Location deleted successfully!");
			return true;
		} catch (error) {
			console.error(`Error deleting location ${id}:`, error);
			toast.error("Failed to delete location.");
			return false;
		}
	},
};

// Helper function to map Firestore doc data to Employee type
const mapDocToEmployee = (docSnap: DocumentSnapshot): Employee => {
	const data = docSnap.data() as any;
	const employee: Employee = {
		id: docSnap.id,
		organizationId: data.organizationId,
		name: data.name,
		email: data.email,
		position: data.position,
		phone: data.phone,
		hireDate: data.hireDate,
		address: data.address,
		emergencyContact: data.emergencyContact,
		notes: data.notes,
		avatar: data.avatar,
		hourlyRate:
			typeof data.hourlyRate === "string"
				? parseFloat(data.hourlyRate)
				: data.hourlyRate,
		status: data.status,
		isOnline: data.isOnline,
		lastActive:
			data.lastActive instanceof Timestamp
				? data.lastActive.toDate().toISOString()
				: data.lastActive,
		custom_properties: data.custom_properties || {}, // Ensure custom_properties exists
		createdAt:
			data.createdAt instanceof Timestamp
				? data.createdAt.toDate().toISOString()
				: data.createdAt,
		updatedAt:
			data.updatedAt instanceof Timestamp
				? data.updatedAt.toDate().toISOString()
				: data.updatedAt,
	};
	// Explicitly ensure locationAssignments is an array if it exists in custom_properties
	if (
		employee.custom_properties &&
		!Array.isArray(employee.custom_properties.locationAssignments)
	) {
		employee.custom_properties.locationAssignments = [];
	}
	return employee;
};

// Employees API (Refactored for Firestore)
export const EmployeesAPI = {
	getAll: async (organizationId?: string): Promise<Employee[]> => {
		if (!organizationId) {
			console.error("getAll employees called without organizationId.");
			return [];
		}
		try {
			const employeesRef = collection(db, "employees");
			const q = query(
				employeesRef,
				where("organizationId", "==", organizationId)
			);
			const querySnapshot = await getDocs(q);
			const employees: Employee[] = [];
			querySnapshot.forEach((docSnap) => {
				employees.push(mapDocToEmployee(docSnap)); // Use helper
			});
			return employees;
		} catch (error) {
			console.error("Error fetching employees:", error);
			return [];
		}
	},

	getById: async (id: string): Promise<Employee | null> => {
		if (!id) {
			console.error("getById called without id.");
			return null;
		}
		try {
			const employeeRef = doc(db, "employees", id);
			const docSnap = await getDoc(employeeRef);
			if (docSnap.exists()) {
				console.log(`Successfully fetched employee:`, docSnap.data());
				return mapDocToEmployee(docSnap); // Use helper
			} else {
				console.log(`Employee with id ${id} not found.`);
				toast.error("Employee not found.");
				return null;
			}
		} catch (error) {
			console.error("Error fetching employee by ID:", error);
			toast.error("Failed to fetch employee details.");
			return null;
		}
	},

	create: async (
		data: Omit<Employee, "id" | "createdAt" | "updatedAt">
	): Promise<Employee | null> => {
		if (!data.organizationId) {
			console.error("Cannot create employee without organizationId");
			toast.error("Organization ID is missing.");
			return null;
		}
		try {
			const employeeData = {
				...data,
				position: data.position || "Employee",
				status: data.status || "active",
				isOnline: data.isOnline || false,
				lastActive: data.lastActive
					? Timestamp.fromDate(parseISO(data.lastActive))
					: serverTimestamp(), // Convert if string, else use server time
				custom_properties: data.custom_properties || {
					locationAssignments: [],
				}, // Initialize if needed
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			};
			// Ensure locationAssignments is an array within custom_properties
			if (
				employeeData.custom_properties &&
				!Array.isArray(employeeData.custom_properties.locationAssignments)
			) {
				employeeData.custom_properties.locationAssignments = [];
			}

			const docRef = await addDoc(collection(db, "employees"), employeeData);
			const newDocSnap = await getDoc(docRef);
			if (!newDocSnap.exists()) {
				throw new Error("Failed to fetch newly created employee document.");
			}
			toast.success("Employee created successfully!");
			return mapDocToEmployee(newDocSnap); // Use helper
		} catch (error) {
			console.error("Error creating employee:", error);
			toast.error("Failed to create employee.");
			return null;
		}
	},

	update: async (
		id: string,
		data: Partial<Omit<Employee, "id" | "createdAt">> // Allow updating updatedAt indirectly and custom_props
	): Promise<Employee | null> => {
		if (!id) {
			console.error("update employee called without id.");
			toast.error("Cannot update employee: ID is missing.");
			return null;
		}
		try {
			const employeeRef = doc(db, "employees", id);
			const updatePayload: Record<string, any> = { ...data };

			// Handle specific type conversions if needed (e.g., hourlyRate, lastActive)
			if (
				updatePayload.hourlyRate !== undefined &&
				typeof updatePayload.hourlyRate === "string"
			) {
				updatePayload.hourlyRate = parseFloat(updatePayload.hourlyRate);
			}
			if (
				updatePayload.hourlyRate !== undefined &&
				typeof updatePayload.hourlyRate !== "number"
			) {
				delete updatePayload.hourlyRate;
			}
			if (
				updatePayload.lastActive &&
				typeof updatePayload.lastActive === "string"
			) {
				updatePayload.lastActive = Timestamp.fromDate(
					parseISO(updatePayload.lastActive)
				);
			}
			// Ensure locationAssignments update is an array
			if (
				updatePayload.custom_properties &&
				updatePayload.custom_properties.locationAssignments &&
				!Array.isArray(updatePayload.custom_properties.locationAssignments)
			) {
				// Handle error or default to empty array based on desired behavior
				console.warn(
					"Attempted to update locationAssignments with non-array value, resetting."
				);
				// Option 1: Reset/ignore
				// delete updatePayload.custom_properties.locationAssignments;
				// Option 2: Set to empty array (safer)
				updatePayload.custom_properties.locationAssignments = [];
			}

			const updateData = {
				...updatePayload,
				updatedAt: serverTimestamp(),
			};

			await updateDoc(employeeRef, updateData);
			const updatedDocSnap = await getDoc(employeeRef);
			if (!updatedDocSnap.exists()) {
				throw new Error("Failed to fetch updated employee document.");
			}
			toast.success("Employee updated successfully!");
			return mapDocToEmployee(updatedDocSnap); // Use helper
		} catch (error) {
			console.error("Error updating employee:", error);
			toast.error("Failed to update employee.");
			return null;
		}
	},

	delete: async (id: string): Promise<boolean> => {
		if (!id) {
			console.error("delete employee called without id.");
			toast.error("Cannot delete employee: ID is missing.");
			return false;
		}
		try {
			const employeeRef = doc(db, "employees", id);
			await deleteDoc(employeeRef);
			console.log(`Employee ${id} deleted.`);
			toast.success("Employee deleted successfully!");
			return true;
		} catch (error) {
			console.error(`Error deleting employee ${id}:`, error);
			toast.error("Failed to delete employee.");
			return false;
		}
	},

	// --- New Methods for Location Assignments ---

	assignLocations: async (
		employeeId: string,
		locationIds: string[]
	): Promise<boolean> => {
		if (!employeeId) {
			console.error("assignLocations called without employeeId.");
			toast.error("Employee ID missing.");
			return false;
		}
		if (!Array.isArray(locationIds)) {
			console.error("assignLocations called with non-array locationIds.");
			toast.error("Invalid location assignments format.");
			return false;
		}

		try {
			const employeeRef = doc(db, "employees", employeeId);
			// Use updateDoc to specifically set the locationAssignments array
			// This uses dot notation to update a field within the map
			await updateDoc(employeeRef, {
				"custom_properties.locationAssignments": locationIds,
				updatedAt: serverTimestamp(),
			});
			toast.success("Employee locations updated successfully!");
			return true;
		} catch (error) {
			console.error(
				`Error assigning locations to employee ${employeeId}:`,
				error
			);
			toast.error("Failed to update employee locations.");
			return false;
		}
	},

	getEmployeesByLocationId: async (
		locationId: string,
		organizationId?: string
	): Promise<Employee[]> => {
		if (!locationId) {
			console.error("getEmployeesByLocationId called without locationId.");
			return [];
		}
		try {
			const employeesRef = collection(db, "employees");
			const conditions: QueryConstraint[] = [
				where(
					"custom_properties.locationAssignments",
					"array-contains",
					locationId
				),
			];
			// Optionally filter by organizationId as well for security/scoping
			if (organizationId) {
				conditions.push(where("organizationId", "==", organizationId));
			}

			const q = query(employeesRef, ...conditions);
			const querySnapshot = await getDocs(q);
			const employees: Employee[] = [];
			querySnapshot.forEach((docSnap) => {
				employees.push(mapDocToEmployee(docSnap));
			});
			return employees;
		} catch (error) {
			console.error(
				`Error fetching employees for location ${locationId}:`,
				error
			);
			return [];
		}
	},
};

// Shift Assignments API (Refactored for Firestore)
export const ShiftAssignmentsAPI = {
	// Get all assignments (optionally filtered by shiftId)
	getAll: async (filter?: {
		shiftId?: string;
		employeeId?: string;
		organizationId?: string;
	}): Promise<ShiftAssignment[]> => {
		try {
			const assignmentsRef = collection(db, "shiftAssignments");
			let conditions: QueryConstraint[] = []; // Use QueryConstraint for type safety

			if (filter?.shiftId) {
				console.log("Filtering assignments by shiftId:", filter.shiftId);
				conditions.push(where("shiftId", "==", filter.shiftId));
			}
			if (filter?.employeeId) {
				console.log("Filtering assignments by employeeId:", filter.employeeId);
				conditions.push(where("employeeId", "==", filter.employeeId));
			}
			if (filter?.organizationId) {
				console.log(
					"Filtering assignments by organizationId:",
					filter.organizationId
				);
				conditions.push(where("organizationId", "==", filter.organizationId));
			}
			// Add orderBy if needed, e.g., orderBy("createdAt", "desc")

			const q = query(assignmentsRef, ...conditions);
			const querySnapshot = await getDocs(q);

			const assignments: ShiftAssignment[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				assignments.push({
					id: doc.id,
					shiftId: data.shiftId,
					employeeId: data.employeeId,
					organizationId: data.organizationId,
					// Map timestamp if stored
					// createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
				});
			});
			console.log(
				`ShiftAssignmentsAPI.getAll returned ${assignments.length} assignments`
			);
			return assignments;
		} catch (error) {
			console.error("Error fetching shift assignments:", error);
			return [];
		}
	},

	// Create a new assignment
	create: async (
		data: Omit<ShiftAssignment, "id" | "createdAt"> // Use camelCase input type
	): Promise<ShiftAssignment | null> => {
		if (!data.shiftId || !data.employeeId) {
			console.error("create assignment called without shiftId or employeeId.");
			toast.error(
				"Shift ID and Employee ID are required to create assignment."
			);
			return null;
		}
		console.log("ShiftAssignmentsAPI.create called with data:", data);
		try {
			const assignmentData = {
				...data,
				createdAt: serverTimestamp(), // Add timestamp on creation
			};
			const docRef = await addDoc(
				collection(db, "shiftAssignments"),
				assignmentData
			);
			const newDocSnap = await getDoc(docRef);
			if (!newDocSnap.exists()) {
				throw new Error("Failed to fetch newly created shift assignment.");
			}
			const createdData = newDocSnap.data();
			const newAssignment: ShiftAssignment = {
				id: newDocSnap.id,
				shiftId: createdData.shiftId,
				employeeId: createdData.employeeId,
				organizationId: createdData.organizationId,
				createdAt:
					createdData.createdAt instanceof Timestamp
						? createdData.createdAt.toDate().toISOString()
						: undefined,
			};

			console.log("Shift assignment created successfully:", newAssignment);
			toast.success("Shift assignment created successfully!");
			return newAssignment;
		} catch (error) {
			console.error("Error creating shift assignment:", error);
			toast.error(
				`Failed to create shift assignment: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
			return null;
		}
	},

	// Delete an assignment by its Firestore document ID
	delete: async (id: string): Promise<boolean> => {
		if (!id) {
			console.error("delete assignment called without id.");
			toast.error("Assignment ID required for deletion.");
			return false;
		}
		try {
			const assignmentRef = doc(db, "shiftAssignments", id);
			await deleteDoc(assignmentRef);
			toast.success("Shift assignment deleted successfully!");
			return true;
		} catch (error) {
			console.error(`Error deleting shift assignment ${id}:`, error);
			toast.error("Failed to delete shift assignment");
			return false;
		}
	},

	// Bulk delete assignments (e.g., when deleting a shift)
	deleteByShiftId: async (shiftId: string): Promise<boolean> => {
		if (!shiftId) {
			console.error("deleteByShiftId called without shiftId.");
			return false;
		}
		try {
			const assignmentsRef = collection(db, "shiftAssignments");
			const q = query(assignmentsRef, where("shiftId", "==", shiftId));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				console.log(`No assignments found for shift ${shiftId} to delete.`);
				return true; // Nothing to delete
			}

			const batch = writeBatch(db);
			querySnapshot.forEach((docSnap) => {
				batch.delete(docSnap.ref);
			});

			await batch.commit();
			console.log(
				`Deleted ${querySnapshot.size} assignments for shift ${shiftId}.`
			);
			// No toast here usually, part of a larger operation
			return true;
		} catch (error) {
			console.error(`Error deleting assignments for shift ${shiftId}:`, error);
			// Possibly toast error if needed
			return false;
		}
	},
};

// Helper function to map Firestore doc data to Notification type
const mapDocToNotification = (docSnap: DocumentSnapshot): Notification => {
	const data = docSnap.data() as any;
	return {
		id: docSnap.id,
		userId: data.userId,
		organizationId: data.organizationId,
		type: data.type,
		title: data.title,
		message: data.message,
		isRead: data.isRead,
		isActionRequired: data.isActionRequired,
		actionUrl: data.actionUrl,
		relatedEntityId: data.relatedEntityId,
		relatedEntityType: data.relatedEntityType,
		createdAt:
			data.createdAt instanceof Timestamp
				? data.createdAt.toDate().toISOString()
				: data.createdAt,
	};
};

// Notifications API (Refactored for Firestore)
export const NotificationsAPI = {
	getAll: async (userId: string): Promise<Notification[]> => {
		if (!userId) {
			console.error("getAll notifications called without userId.");
			return [];
		}
		console.log("Fetching notifications for user:", userId);
		try {
			const notificationsRef = collection(db, "notifications");
			const q = query(
				notificationsRef,
				where("userId", "==", userId),
				orderBy("createdAt", "desc")
			);
			const querySnapshot = await getDocs(q);
			const notifications: Notification[] = [];
			querySnapshot.forEach((docSnap) => {
				notifications.push(mapDocToNotification(docSnap));
			});
			return notifications;
		} catch (error) {
			console.error("Error fetching notifications:", error);
			return [];
		}
	},

	getUnread: async (userId: string): Promise<Notification[]> => {
		if (!userId) {
			console.error("getUnread notifications called without userId.");
			return [];
		}
		try {
			const notificationsRef = collection(db, "notifications");
			const q = query(
				notificationsRef,
				where("userId", "==", userId),
				where("isRead", "==", false),
				orderBy("createdAt", "desc")
			);
			const querySnapshot = await getDocs(q);
			const notifications: Notification[] = [];
			querySnapshot.forEach((docSnap) => {
				notifications.push(mapDocToNotification(docSnap));
			});
			return notifications;
		} catch (error) {
			console.error("Error fetching unread notifications:", error);
			return [];
		}
	},

	create: async (
		data: Omit<Notification, "id" | "createdAt">
	): Promise<Notification | null> => {
		if (!data.userId) {
			console.error("create notification called without userId.");
			toast.error("User ID missing for notification.");
			return null;
		}
		try {
			const notificationData = {
				...data,
				isRead: data.isRead || false,
				createdAt: serverTimestamp(),
			};
			const docRef = await addDoc(
				collection(db, "notifications"),
				notificationData
			);
			const newDocSnap = await getDoc(docRef);
			if (!newDocSnap.exists()) {
				throw new Error("Failed to fetch newly created notification.");
			}
			console.log("Notification created:", newDocSnap.id);
			// No toast by default for creation, might be system generated
			return mapDocToNotification(newDocSnap);
		} catch (error) {
			console.error("Error creating notification:", error);
			toast.error("Failed to create notification.");
			return null;
		}
	},

	markAsRead: async (id: string): Promise<boolean> => {
		if (!id) {
			console.error("markAsRead called without id.");
			toast.error("Notification ID missing.");
			return false;
		}
		try {
			const notificationRef = doc(db, "notifications", id);
			await updateDoc(notificationRef, { isRead: true });
			toast.success("Notification marked as read");
			return true;
		} catch (error) {
			console.error(`Error marking notification ${id} as read:`, error);
			toast.error("Failed to mark notification as read");
			return false;
		}
	},

	markAllAsRead: async (userId: string): Promise<boolean> => {
		if (!userId) {
			console.error("markAllAsRead called without userId.");
			toast.error("User ID missing.");
			return false;
		}
		try {
			const notificationsRef = collection(db, "notifications");
			const q = query(
				notificationsRef,
				where("userId", "==", userId),
				where("isRead", "==", false) // Only target unread ones
			);
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				toast.info("No unread notifications to mark.");
				return true; // Nothing to do
			}

			const batch = writeBatch(db);
			querySnapshot.forEach((docSnap) => {
				batch.update(docSnap.ref, { isRead: true });
			});

			await batch.commit();
			toast.success("All notifications marked as read");
			return true;
		} catch (error) {
			console.error(
				`Error marking all notifications as read for user ${userId}:`,
				error
			);
			toast.error("Failed to mark all notifications as read");
			return false;
		}
	},

	dismissNotification: async (id: string): Promise<boolean> => {
		if (!id) {
			console.error("dismissNotification called without id.");
			toast.error("Notification ID missing.");
			return false;
		}
		try {
			const notificationRef = doc(db, "notifications", id);
			await deleteDoc(notificationRef);
			toast.success("Notification dismissed");
			return true;
		} catch (error) {
			console.error(`Error dismissing notification ${id}:`, error);
			toast.error("Failed to dismiss notification");
			return false;
		}
	},

	dismissAllNotifications: async (userId: string): Promise<boolean> => {
		if (!userId) {
			console.error("dismissAllNotifications called without userId.");
			toast.error("User ID missing.");
			return false;
		}
		try {
			const notificationsRef = collection(db, "notifications");
			const q = query(notificationsRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				toast.info("No notifications to dismiss.");
				return true; // Nothing to do
			}

			const batch = writeBatch(db);
			querySnapshot.forEach((docSnap) => {
				batch.delete(docSnap.ref);
			});

			await batch.commit();
			toast.success("All notifications dismissed");
			return true;
		} catch (error) {
			console.error(
				`Error dismissing all notifications for user ${userId}:`,
				error
			);
			toast.error("Failed to dismiss all notifications");
			return false;
		}
	},
};

// Employee Locations API (Refactored for Firestore)
export const EmployeeLocationsAPI = {
	getByEmployeeId: async (employeeId: string): Promise<string[]> => {
		if (!employeeId) return [];
		try {
			const assignmentsRef = collection(db, "employeeLocations");
			const q = query(assignmentsRef, where("employeeId", "==", employeeId));
			const querySnapshot = await getDocs(q);
			const locationIds = querySnapshot.docs.map(
				(doc) => doc.data().locationId as string
			);
			return locationIds;
		} catch (error) {
			console.error(
				`Error fetching locations for employee ${employeeId}:`,
				error
			);
			return [];
		}
	},

	getByLocationId: async (locationId: string): Promise<string[]> => {
		if (!locationId) return [];
		try {
			const assignmentsRef = collection(db, "employeeLocations");
			const q = query(assignmentsRef, where("locationId", "==", locationId));
			const querySnapshot = await getDocs(q);
			const employeeIds = querySnapshot.docs.map(
				(doc) => doc.data().employeeId as string
			);
			console.log(
				`Found ${employeeIds.length} employees for location ${locationId}`
			);
			return employeeIds;
		} catch (error) {
			console.error(
				`Error fetching employees for location ${locationId}:`,
				error
			);
			return [];
		}
	},

	// Assigns a list of locations to an employee, replacing previous assignments.
	// Requires organizationId for scoping queries.
	assignLocations: async (
		employeeId: string,
		locationIds: string[],
		organizationId: string // Added orgId for delete query scoping
	): Promise<boolean> => {
		if (!employeeId || !organizationId) {
			console.error(
				"assignLocations called without employeeId or organizationId."
			);
			toast.error("Employee and Organization ID are required.");
			return false;
		}
		if (!Array.isArray(locationIds)) {
			console.error("assignLocations called with non-array locationIds.");
			toast.error("Invalid location assignments format.");
			return false;
		}

		try {
			const assignmentsRef = collection(db, "employeeLocations");
			const batch = writeBatch(db);

			// 1. Query existing assignments for this employee within the org
			const q = query(
				assignmentsRef,
				where("employeeId", "==", employeeId),
				where("organizationId", "==", organizationId) // Scope delete by org
			);
			const existingSnapshot = await getDocs(q);

			// 2. Delete existing assignments in the batch
			existingSnapshot.forEach((doc) => {
				batch.delete(doc.ref);
			});

			// 3. Add new assignments in the batch
			if (locationIds.length > 0) {
				locationIds.forEach((locationId) => {
					if (locationId) {
						// Ensure locationId is not empty/null
						const newAssignmentRef = doc(assignmentsRef); // Auto-generate ID
						batch.set(newAssignmentRef, {
							employeeId: employeeId,
							locationId: locationId,
							organizationId: organizationId,
							createdAt: serverTimestamp(),
						});
					}
				});
			}

			// 4. Commit the batch
			await batch.commit();
			console.log(`Updated location assignments for employee ${employeeId}.`);
			toast.success("Employee locations updated successfully!");
			return true;
		} catch (error) {
			console.error(
				`Error assigning locations for employee ${employeeId}:`,
				error
			);
			toast.error("Failed to update employee locations.");
			return false;
		}
	},
};

// Messages and Conversations API ...
