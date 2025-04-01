#!/bin/bash

# Find direct imports from ./organization
echo "=== Files importing directly from ./organization ==="
grep -r "from ['\"].*\/organization['\"]" src/ --include="*.tsx" --include="*.ts" | grep -v "organization-context" | grep -v "organization-utils"

echo ""
echo "=== Files using useOrganization ==="
grep -r "useOrganization" src/ --include="*.tsx" --include="*.ts" | grep -v "organization-context.tsx"

echo ""
echo "=== Files referencing OrganizationProvider ==="
grep -r "OrganizationProvider" src/ --include="*.tsx" --include="*.ts" | grep -v "organization-context.tsx"

echo ""
echo "=== Property references to 'organization' that might need to change to 'currentOrganization' ==="
grep -r "organization\." src/ --include="*.tsx" --include="*.ts" | grep -v "organization-context.tsx" 