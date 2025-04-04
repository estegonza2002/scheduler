import {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { app } from "./firebase"; // Assuming firebase initializes and exports 'app'

// Get Firebase services
const storage = getStorage(app);
const auth = getAuth(app);

/**
 * Uploads an image to Firebase Cloud Storage
 */
export async function uploadImage(
	file: File,
	bucketPath: string = "location-images/public" // Firebase uses a single path structure
): Promise<string> {
	try {
		console.log(`Attempting to upload to path: ${bucketPath}`);

		// Check authentication status first
		const user = auth.currentUser;
		console.log("Auth status:", user ? "Authenticated" : "Not authenticated");

		if (!user) {
			console.error("User not authenticated");
			throw new Error("User not authenticated");
		}

		// Generate a unique file name
		const fileExt = file.name.split(".").pop();
		const fileName = `${uuidv4()}.${fileExt}`;
		const filePath = `${bucketPath}/${fileName}`; // Full path including folders

		console.log(`File path for upload: ${filePath}`);
		console.log(`User ID for upload: ${user.uid}`);

		// Create a storage reference
		const storageRef = ref(storage, filePath);

		// Upload the file to Firebase Storage
		const snapshot = await uploadBytes(storageRef, file, {
			cacheControl: "public, max-age=3600", // Example cache control
		});
		console.log("Upload successful, snapshot:", snapshot);

		// Get the public download URL
		const downloadURL = await getDownloadURL(snapshot.ref);

		console.log("Download URL:", downloadURL);
		return downloadURL;
	} catch (error: any) {
		console.error("Exception in uploadImage:", error);
		// Log specific Firebase Storage errors if available
		if (error.code) {
			console.error(
				`Firebase Storage Error Code: ${error.code}, Message: ${error.message}`
			);
		}
		throw error; // Re-throw the error after logging
	}
}

/**
 * Deletes an image from Firebase Cloud Storage using its download URL
 */
export async function deleteImage(url: string): Promise<boolean> {
	try {
		// Basic check if it looks like a Firebase Storage URL
		if (!url || !url.includes("firebasestorage.googleapis.com")) {
			console.log("Skipping deletion, not a valid Firebase Storage URL:", url);
			return true; // Or false, depending on desired behavior for invalid URLs
		}

		// Check authentication status first
		const user = auth.currentUser;
		if (!user) {
			console.error("User not authenticated for deletion");
			throw new Error("User not authenticated");
		}

		console.log(`Attempting to delete from URL: ${url}`);
		console.log(`User ID for deletion: ${user.uid}`);

		// Create a reference from the download URL
		const storageRef = ref(storage, url);

		console.log(`Deleting file reference: ${storageRef.fullPath}`);

		// Delete the file
		await deleteObject(storageRef);

		console.log("Deletion successful for:", url);
		return true;
	} catch (error: any) {
		console.error("Exception in deleteImage:", error);
		// Log specific Firebase Storage errors if available
		if (error.code === "storage/object-not-found") {
			console.warn("Attempted to delete an object that does not exist:", url);
			// Decide if this should be treated as success (it's already gone) or failure
			return true; // Assuming idempotency: if it's gone, the goal is achieved.
		} else if (error.code) {
			console.error(
				`Firebase Storage Error Code: ${error.code}, Message: ${error.message}`
			);
		}
		return false; // Return false on error
	}
}
