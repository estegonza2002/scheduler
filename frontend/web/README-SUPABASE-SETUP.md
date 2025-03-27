# Supabase Setup Instructions

This guide will help you set up your Supabase instance to work with the Scheduler application.

## Prerequisites

1. A Supabase account
2. Access to your Supabase project
3. The application's environment variables properly configured in `.env`

## Steps to Set Up Database Tables

### Option 1: Using the Supabase SQL Editor

1. Log in to your Supabase Dashboard
2. Select your project
3. Go to the SQL Editor (left sidebar)
4. Create a New Query
5. Copy the entire contents of the `supabase_corrected_schema.sql` file
6. Paste into the SQL editor
7. Run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push --db-url <your-supabase-db-url> --file ./supabase_corrected_schema.sql
```

## Verify the Setup

After running the SQL script, verify your tables:

1. Go to the Table Editor in Supabase
2. You should see the following tables:

   - organizations
   - locations
   - employees
   - shifts
   - shift_assignments
   - notifications

3. Each table should contain the sample data defined in the script

## Common Issues

### Issue: "Failed to create location" error

- **Cause**: Mismatch between column names in database and properties in app
- **Solution**: The corrected schema uses snake_case for column names (e.g., `organization_id` instead of `organizationId`)

### Issue: "Failed to load resource" error

- **Cause**: Application can't connect to Supabase
- **Solution**: Ensure your Supabase URL and anon key are correct in `.env`

## Environment Variables

Make sure your `.env` file contains:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Testing the Connection

You can test if your Supabase connection is working by:

1. Running the app (`npm run dev`)
2. Opening the browser dev tools
3. In the Console, look for messages that say "Using REAL API implementation"
4. Check for any error messages related to Supabase

If you see error messages like "Failed to create location" or "Failed to fetch notifications", follow the solutions above.
