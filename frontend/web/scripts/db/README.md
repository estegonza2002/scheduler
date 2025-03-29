# Database Scripts

This directory contains SQL scripts for maintaining the database schema and fixing common issues.

## Row Level Security (RLS) Scripts

### add_shifts_rls_policies.sql

This script adds Row Level Security (RLS) policies to the `shifts` table. This ensures that users can only see and modify shifts within their own organizations, fixing the "row-level security policy" errors.

#### Usage

1. Connect to your Supabase instance via the CLI or web interface
2. Run the SQL script:

```bash
# Using Supabase CLI
supabase db execute -f scripts/db/add_shifts_rls_policies.sql

# Or copy and paste the SQL into the Supabase SQL Editor
```

## Troubleshooting

If you're still encountering RLS policy errors after running the script, verify that:

1. The `shifts` table has the `organization_id` column and it's properly populated
2. The user making the request is a member of the organization
3. The organization exists in the `organizations` table
