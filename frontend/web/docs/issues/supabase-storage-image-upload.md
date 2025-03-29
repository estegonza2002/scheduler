# Supabase Storage Image Upload Issue

Fix image upload functionality for locations using Supabase Storage.

## Problem

The image upload functionality for location images is currently not working due to RLS (Row Level Security) policy issues. Users are experiencing 403 Unauthorized errors when attempting to upload images to the "location-images" bucket.

## Steps to Reproduce

1. Navigate to edit a location
2. Click "Upload Image" and select an image
3. Observe the error in console: "Error uploading file: [403 error] 'Unauthorized', message: 'new row violates row-level security policy'"

## Technical Details

- The app is trying to upload images to a bucket named "location-images" in Supabase storage
- The bucket exists but doesn't have proper RLS policies configured
- The folder structure is currently set to use "public/" for organizing files
- Authentication appears to be working correctly but permissions aren't properly set

## Tasks

### 1. Create Supabase Storage Policies

- [ ] Log in to Supabase Dashboard
- [ ] Navigate to Storage → Buckets → "location-images"
- [ ] Go to the Policies tab
- [ ] Create the following policies:
  - [ ] **SELECT policy**:
    - Name: "Allow public access to images"
    - Allowed operation: SELECT
    - Target roles: public
    - Policy definition: `(bucket_id = 'location-images'::text)`
  - [ ] **INSERT policy**:
    - Name: "Allow authenticated users to upload images"
    - Allowed operation: INSERT
    - Target roles: authenticated
    - Policy definition: `(bucket_id = 'location-images'::text)`
  - [ ] **UPDATE policy**:
    - Name: "Allow authenticated users to update images"
    - Allowed operation: UPDATE
    - Target roles: authenticated
    - Policy definition: `(bucket_id = 'location-images'::text)`
  - [ ] **DELETE policy**:
    - Name: "Allow authenticated users to delete images"
    - Allowed operation: DELETE
    - Target roles: authenticated
    - Policy definition: `(bucket_id = 'location-images'::text)`

### 2. Verify Code Configuration

- [ ] Ensure the `storage.ts` file is correctly configured:
  - [ ] Proper folder structure (using "public" folder)
  - [ ] Proper authentication handling
  - [ ] Correct error handling for different error types

### 3. Testing

- [ ] Test image upload functionality
  - [ ] Verify authenticated users can upload images
  - [ ] Verify images are publicly viewable
  - [ ] Verify images load correctly in UI
- [ ] Test image deletion functionality
  - [ ] Verify authenticated users can delete their images

## Current Status

In progress - The storage.ts file has been updated, but Supabase policies need to be created.

## Dependencies

- Supabase account with admin access
- Valid authenticated sessions for testing

## Related Code

- `src/lib/storage.ts` - Handles image upload/deletion
- `src/components/LocationEditSheet.tsx` - UI for image upload

## Progress Tracking

| Category       | Total Tasks | Completed | Percentage |
| -------------- | ----------- | --------- | ---------- |
| Supabase Setup | 4           | 0         | 0%         |
| Code Fixes     | 3           | 2         | 67%        |
| Testing        | 3           | 0         | 0%         |
| **Overall**    | **10**      | **2**     | **20%**    |
