#!/bin/sh
# Pre-commit hook to check design system compliance

# Get staged TypeScript React files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "\.tsx$")

if [[ "$STAGED_FILES" = "" ]]; then
  echo "No .tsx files staged. Skipping design system lint check."
  exit 0
fi

echo "Running design system ESLint rules on staged files..."

# Check if the ESLint plugin is available
if [ ! -d "./scripts/eslint-rules" ]; then
  echo "Error: Design system ESLint plugin not found"
  exit 1
fi

# Run ESLint with our design system rules on each staged file
for FILE in $STAGED_FILES
do
  if [[ "$FILE" == *"Page.tsx" ]]; then
    echo "Checking $FILE for design system compliance..."
    node scripts/test-design-system-lint.js "$FILE"
    
    if [[ "$?" != 0 ]]; then
      echo "❌ Design system check failed for $FILE"
      echo "Please fix the issues before committing."
      exit 1
    else
      echo "✅ $FILE passed design system checks"
    fi
  fi
done

exit 0 