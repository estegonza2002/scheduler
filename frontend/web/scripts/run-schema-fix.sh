#!/bin/bash

# Script to run the schema fix SQL against the Supabase database

# Get the database URL from environment
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file"
  exit 1
fi

# Extract database information from VITE_SUPABASE_URL
# Format example: https://djyoppufbpvjrahdjhov.supabase.co
DB_HOST=$(echo $VITE_SUPABASE_URL | sed 's/https:\/\///' | sed 's/\.supabase\.co.*//')

# Check if the supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Please install it using:"
  echo "npm install -g @supabase/cli"
  exit 1
fi

# Run the SQL script against the database
echo "Running schema fix SQL..."
supabase db execute --file ./scripts/schema_fix.sql

# Run the Node.js script to complete the migration
echo "Running Node.js migration script..."
node ./scripts/fix-database-schema.js

echo "Schema fix completed!"
