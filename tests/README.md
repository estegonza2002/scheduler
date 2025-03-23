# Test Files

This directory contains test and utility scripts for the Scheduler application, particularly focused on the "shift-203" functionality.

## Available Tests

### test-shift-203-comprehensive.js

A comprehensive test script that verifies:

- The presence and structure of shift-203 in the mockShifts array
- Check-in and check-out tasks for the shift
- Shift modifications made outside the initial declaration
- Assignments linked to shift-203

Usage:

```bash
node tests/test-shift-203-comprehensive.js
```

### test-shift-viewer.html

An HTML interface for viewing shift-203 data. This tool makes an API call to fetch and display shift-203 information in a browser.

Usage:

1. Start the application server
2. Open this HTML file in a browser
3. The page will attempt to fetch and display shift-203 data

### update-shift-203.js

A utility script to add or update the shift-203 data in the mock API. This script:

- Adds check-in and check-out tasks to shift-203
- Creates a new shift-203 entry if it doesn't exist
- Adds shift notes and additional metadata

Usage:

```bash
node tests/update-shift-203.js
```

## Testing Workflow

1. Use `update-shift-203.js` to ensure the shift-203 data exists with all required fields
2. Verify the data structure with `test-shift-203-comprehensive.js`
3. Use `test-shift-viewer.html` to visually inspect the data in a browser
