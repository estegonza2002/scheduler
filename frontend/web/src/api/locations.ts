import { db } from "../lib/firebase";
import { Location } from "./types";
import {
	collection,
	getDocs,
	getDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	query,
	where,
	DocumentSnapshot,
	DocumentData,
} from "firebase/firestore";

// Helper function to map Firestore doc to Location object
const mapDocToLocation = (doc: DocumentSnapshot<DocumentData>): Location => {
	const data = doc.data();
	return {
		id: doc.id,
		organizationId: data?.organizationId || "",
		name: data?.name || "",
		address: data?.address,
		city: data?.city,
		state: data?.state,
		zipCode: data?.zipCode,
		isActive: data?.isActive === undefined ? true : data.isActive, // Default to true if undefined
		latitude: data?.latitude,
		longitude: data?.longitude,
		imageUrl: data?.imageUrl,
	};
};

export const LocationsAPI = {
	// Get all locations for an organization
	async getAll(organizationId?: string): Promise<Location[]> {
		if (!organizationId) {
			console.warn("LocationsAPI.getAll called without organizationId");
			return [];
		}
		const locationsCol = collection(db, "locations");
		const q = query(
			locationsCol,
			where("organizationId", "==", organizationId)
		);
		const snapshot = await getDocs(q);
		return snapshot.docs.map(mapDocToLocation);
	},

	// Get a single location by ID
	async getById(id: string): Promise<Location | null> {
		const docRef = doc(db, "locations", id);
		const docSnap = await getDoc(docRef);
		return docSnap.exists() ? mapDocToLocation(docSnap) : null;
	},

	// Create a new location
	async create(data: Omit<Location, "id">): Promise<Location> {
		const locationsCol = collection(db, "locations");
		const docRef = await addDoc(locationsCol, {
			...data,
			isActive: data.isActive === undefined ? true : data.isActive, // Ensure default
		});
		const newDocSnap = await getDoc(docRef);
		return mapDocToLocation(newDocSnap);
	},

	// Update an existing location
	async update(id: string, data: Partial<Location>): Promise<Location> {
		const docRef = doc(db, "locations", id);
		await updateDoc(docRef, data);
		const updatedDocSnap = await getDoc(docRef);
		return mapDocToLocation(updatedDocSnap);
	},

	// Delete a location
	async delete(id: string): Promise<void> {
		const docRef = doc(db, "locations", id);
		await deleteDoc(docRef);
	},

	// Export the helper function if needed elsewhere, though unlikely
	mapDocToLocation,
};
