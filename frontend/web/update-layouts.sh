#!/bin/bash

# Script to standardize layout in all page components
# Updates pages to use PageHeader, PageContentSpacing, and ContentContainer consistently

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RESET='\033[0m'

# Pages to skip (already updated)
SKIP_FILES=(
  "AdminDashboardPage.tsx"
  "DashboardPage.tsx"
  "ShiftDetailsPage.tsx"
  "BillingPage.tsx"
)

# Auth pages to skip (have their own layout pattern)
AUTH_PAGES=(
  "LoginPage.tsx"
  "SignUpPage.tsx"
  "BusinessSignUpPage.tsx"
  "ForgotPasswordPage.tsx"
  "ResetPasswordPage.tsx"
)

# Directory containing pages
PAGES_DIR="./src/pages"

# Check if the directory exists
if [ ! -d "$PAGES_DIR" ]; then
  echo "Error: Pages directory not found at $PAGES_DIR"
  exit 1
fi

# Count variables
total_pages=0
updated_pages=0
skipped_pages=0
auth_pages=0

# Process each page file
for file in "$PAGES_DIR"/*Page.tsx; do
  filename=$(basename "$file")
  total_pages=$((total_pages + 1))
  
  # Skip files that are already updated
  if [[ " ${SKIP_FILES[@]} " =~ " ${filename} " ]]; then
    echo -e "${YELLOW}Skipping ${filename} (already updated)${RESET}"
    skipped_pages=$((skipped_pages + 1))
    continue
  fi
  
  # Skip auth pages
  if [[ " ${AUTH_PAGES[@]} " =~ " ${filename} " ]]; then
    echo -e "${YELLOW}Skipping ${filename} (auth page)${RESET}"
    auth_pages=$((auth_pages + 1))
    continue
  fi

  echo "Processing $filename..."
  
  # Check if PageContentSpacing is already imported
  if ! grep -q "import.*PageContentSpacing" "$file"; then
    # Add PageContentSpacing import
    if grep -q "import.*header-content-spacing" "$file"; then
      # Add to existing import
      sed -i '' 's/import {/import { PageContentSpacing, /g' "$file"
    else
      # Add as a new import
      if grep -q "import.*ContentContainer" "$file"; then
        # Add after ContentContainer import
        sed -i '' '/import.*ContentContainer/a\
import { PageContentSpacing } from "../components/ui/header-content-spacing";' "$file"
      else
        # Add ContentContainer import as well
        sed -i '' '/import.*PageHeader/a\
import { PageContentSpacing } from "../components/ui/header-content-spacing";\
import { ContentContainer } from "../components/ui/content-container";' "$file"
      fi
    fi
  fi
  
  # Add ContentContainer import if missing
  if ! grep -q "import.*ContentContainer" "$file"; then
    sed -i '' '/import.*PageHeader/a\
import { ContentContainer } from "../components/ui/content-container";' "$file"
  fi
  
  # Check if the file doesn't already use PageContentSpacing
  if ! grep -q "<PageContentSpacing>" "$file"; then
    # Look for PageHeader closing tag and add PageContentSpacing after it
    if grep -q "</PageHeader>" "$file"; then
      # The complex part: find the right place to add the wrapping tags
      # This is tricky since we don't want to break existing structure
      # Using a temporary file to enable multi-line substitution
      
      # First, create a pattern to match the PageHeader closing tag followed by content
      # Then wrap the content with PageContentSpacing and ContentContainer
      
      # Note: This is a simplified approach and might need manual fixes for some files
      # The complexity of React component structure makes automatic transformation challenging
      
      # Try to find common patterns for content after PageHeader
      if grep -q "<PageHeader.*/>.*<div" "$file"; then
        # Simple case: PageHeader followed directly by a div
        sed -i '' 's/<PageHeader.*\/>\s*<div/<PageHeader\n\t\t\t\t\title="Page Title"\n\t\t\t\t\/>\n\t\t\t<PageContentSpacing>\n\t\t\t\t<ContentContainer>\n\t\t\t\t\t<div/g' "$file"
        # Add closing tags at the end (simplified)
        sed -i '' 's/<\/div>\s*<\/>/\n\t\t\t\t<\/div>\n\t\t\t\t<\/ContentContainer>\n\t\t\t<\/PageContentSpacing>\n\t\t</>/g' "$file"
      else
        # More complex cases may need manual adjustment
        echo "Complex layout structure detected in $filename. Please update manually."
        continue
      fi
    else
      echo "Could not find PageHeader in $filename. Please update manually."
      continue
    fi
  fi
  
  echo -e "${GREEN}Updated ${filename}${RESET}"
  updated_pages=$((updated_pages + 1))
done

# Print summary
echo -e "\n${GREEN}======= Layout Standardization Summary =======${RESET}"
echo "Total pages: $total_pages"
echo "Updated pages: $updated_pages"
echo "Skipped pages (already updated): $skipped_pages"
echo "Skipped auth pages: $auth_pages"
echo -e "${YELLOW}Note: Some complex pages may need manual inspection${RESET}"
echo -e "${GREEN}==========================================${RESET}"

echo -e "\nPlease review the changes and fix any issues manually if needed."
echo "For complex layouts, you may need to manually adjust the PageContentSpacing and ContentContainer wrapping."
