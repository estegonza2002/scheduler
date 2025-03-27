/**
 * Script to fix database schema inconsistencies
 * This script standardizes column naming to snake_case
 */

const { createClient } = require("@supabase/supabase-js");

// Supabase client setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Exit if environment variables are not set
if (!supabaseUrl || !supabaseKey) {
	console.error(
		"Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set"
	);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fix the locations table schema
 */
async function fixLocationsTable() {
	console.log("Fixing locations table schema...");

	try {
		// Check if organizationId column exists
		const { data: hasOrgIdColumn, error: checkError } = await supabase
			.from("locations")
			.select("organizationId")
			.limit(1);

		if (
			checkError &&
			!checkError.message.includes('column "organizationId" does not exist')
		) {
			console.error("Error checking organizationId column:", checkError);
			return;
		}

		// If organizationId column exists, migrate data to organization_id
		if (hasOrgIdColumn && hasOrgIdColumn.length > 0) {
			console.log("Migrating data from organizationId to organization_id...");

			// Update all rows to ensure organization_id matches organizationId
			const { error: updateError } = await supabase.rpc(
				"migrate_location_organization_id"
			);

			if (updateError) {
				console.error("Error migrating data:", updateError);
				return;
			}

			console.log("Data migration completed successfully");

			// Now drop the redundant column
			const { error: dropError } = await supabase.rpc(
				"drop_location_organizationId"
			);

			if (dropError) {
				console.error("Error dropping redundant column:", dropError);
				return;
			}

			console.log("Redundant column dropped successfully");
		} else {
			console.log("No organizationId column found, schema is already correct");
		}

		console.log("Locations table schema fixed successfully");
	} catch (error) {
		console.error("Unexpected error fixing locations table:", error);
	}
}

/**
 * Main function to execute the script
 */
async function main() {
	console.log("Starting database schema fix...");

	// First create the necessary stored procedures
	const createProcedures = await supabase.rpc("create_schema_fix_procedures");
	if (createProcedures.error) {
		console.error("Error creating stored procedures:", createProcedures.error);
		process.exit(1);
	}

	// Fix tables
	await fixLocationsTable();

	console.log("Database schema fix completed!");
}

main().catch((error) => {
	console.error("Script failed:", error);
	process.exit(1);
});
