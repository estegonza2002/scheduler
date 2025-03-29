import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an image to Supabase Storage
 */
export async function uploadImage(
	file: File,
	bucket: string = "location-images",
	folder: string = "public"
): Promise<string> {
	try {
		console.log(`Attempting to upload to bucket: ${bucket}`);

		// Check authentication status first
		const { data: authData, error: authError } =
			await supabase.auth.getSession();
		console.log(
			"Auth session:",
			authData?.session ? "Authenticated" : "Not authenticated"
		);

		if (authError) {
			console.error("Auth error:", authError);
			throw new Error("Authentication error: " + authError.message);
		}

		if (!authData?.session) {
			console.error("User not authenticated");
			throw new Error("User not authenticated");
		}

		// Generate a unique file name
		const fileExt = file.name.split(".").pop();
		const fileName = `${uuidv4()}.${fileExt}`;

		// Always use a folder path format that matches your policy
		const filePath = `${folder}/${fileName}`;

		console.log(`File path for upload: ${filePath}`);
		console.log(`User ID for upload: ${authData.session.user.id}`);

		// Upload the file to Supabase
		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: true,
			});

		if (error) {
			console.error("Error uploading file:", error);
			throw error;
		}

		console.log("Upload successful, data:", data);

		// Get the public URL
		const { data: publicUrlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(data.path);

		console.log("Public URL:", publicUrlData);
		return publicUrlData.publicUrl;
	} catch (error) {
		console.error("Exception in uploadImage:", error);
		throw error;
	}
}

/**
 * Deletes an image from Supabase Storage
 */
export async function deleteImage(
	url: string,
	bucket: string = "location-images"
): Promise<boolean> {
	try {
		// Skip if not a valid URL
		if (!url.startsWith("http")) {
			return true;
		}

		// Check authentication status first
		const { data: authData, error: authError } =
			await supabase.auth.getSession();
		if (authError) {
			console.error("Auth error:", authError);
			throw new Error("Authentication error: " + authError.message);
		}

		if (!authData?.session) {
			console.error("User not authenticated");
			throw new Error("User not authenticated");
		}

		console.log(`Attempting to delete from URL: ${url}`);
		console.log(`User ID for deletion: ${authData.session.user.id}`);

		// Extract the file path from the URL
		// The format is typically: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
		const path = new URL(url).pathname;
		const segments = path.split("/");

		// Find the position of the bucket name and "public" in the path
		const bucketIndex = segments.indexOf(bucket);
		const publicIndex = segments.indexOf("public");

		// Construct the file path relative to the bucket
		let filePath;
		if (bucketIndex !== -1 && publicIndex !== -1 && publicIndex > bucketIndex) {
			// If both bucket and "public" are found, extract the path after "public"
			filePath = segments.slice(publicIndex).join("/");
		} else {
			// Fallback: just extract the filename
			filePath = segments.pop() || "";
			// Ensure we include the public folder
			filePath = `public/${filePath}`;
		}

		console.log(`Deleting file: ${filePath}`);

		const { error } = await supabase.storage.from(bucket).remove([filePath]);

		if (error) {
			console.error("Error deleting file:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Exception in deleteImage:", error);
		return false;
	}
}
