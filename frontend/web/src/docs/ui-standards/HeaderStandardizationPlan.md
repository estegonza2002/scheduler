# Header Standardization Plan

## Overview

Based on an audit of the current codebase, we've identified multiple header implementations that need to be standardized. This document outlines our approach to establishing a consistent header pattern across the application.

## Current Header Implementation Analysis

### Header Patterns Found

1. **Application-Level Header (AppLayout.tsx)**

   - Main header in `AppLayout.tsx` that contains:
     - Sidebar trigger
     - Page title based on route
     - Action buttons specific to the page context
     - Notification sheet
     - Sample data toggle (for specific pages)

2. **Page-Level Headers**

   - Standardized `PageHeader` component in `ui/page-header.tsx` that includes:
     - Title
     - Optional description
     - Optional actions
     - Consistent styling and spacing

3. **Layout Component Headers**

   - `PageLayout.tsx` includes header-related components:
     - `PageHeader`
     - `PageTitle`
     - `PageDescription`
   - These components are used in some pages but not consistently

4. **Dialog Headers**

   - Various dialogs have different header implementations
   - Lack of consistency in spacing, actions, and close buttons

5. **Section Headers**
   - `ContentSection` component has its own header pattern
   - Used for dividing content within pages

## Standardization Approach

### 1. Global Application Header

- **Decision**: Simplify the application-level header in `AppLayout.tsx`:
  - Make it a minimal navigation bar with sidebar trigger and global actions
  - Remove duplicated page title from app-level header
  - Use a smaller height to reduce visual prominence
  - Add higher z-index to ensure proper layering
  - Maintain notification access and global controls

### 2. Page Headers

- **Decision**: Make the `PageHeader` component from `ui/page-header.tsx` the primary source of page identity
- **Implementation**:
  - Each page should use PageHeader component for title, description, and main actions
  - PageHeader should appear as the first element within the page content
  - Page-specific action buttons should be placed in the PageHeader actions slot
  - Ensure consistency in padding and spacing

### 3. Dialog Headers

- **Decision**: Created standardized `DialogHeader` component
- **Implementation**:
  - Pattern matches page headers where appropriate
  - Includes consistent close button placement
  - Standardizes title/description styling to match page headers

### 4. Section Headers

- **Decision**: Keep the `ContentSection` header pattern but ensure it's visually harmonious with the page headers

## Updated Implementation Plan

### Phase 1: Header Audit (Completed)

- [x] Review all components for header implementations
- [x] Document all instances of headers
- [x] Categorize headers by type and usage
- [x] Identify discrepancies in styling, spacing, and functionality

### Phase 2: Component Creation/Updates (Completed)

- [x] Refine the existing `PageHeader` component to work in all contexts
- [x] Create a standardized `DialogHeader` component
- [x] Update `ContentSection` header styling for consistency
- [x] Review mobile behavior of all header types

### Phase 3: Migration and Implementation (In Progress)

- [x] Update `AppLayout.tsx` to use a minimal header approach
- [x] Update key pages to use the standardized `PageHeader` as primary header
- [x] Update several key dialogs to use the new `DialogHeader`:
  - [x] AddEmployeeDialog
  - [x] EditLocationDialog
  - [x] EmployeeDetailDialog
  - [x] DeleteEmployeeDialog
- [ ] Continue updating remaining dialogs
- [ ] Validate header consistency across the application

### Phase 4: Documentation and Standards (In Progress)

- [x] Update UI standards documentation with header guidelines
- [x] Create examples of proper header usage
- [x] Document header component props and variants
- [x] Create dialog migration guide for developers
- [ ] Add header components to the component guide

## Expected Visual Hierarchy

To create a clear visual hierarchy and prevent header duplication:

1. **App Header** (minimal)
   - Height: 12px (reduced from 16px)
   - Contains: Sidebar trigger and global actions only
   - No page title
2. **Page Header** (primary identity)

   - Full-width
   - Contains: Page title, description, and primary actions
   - Visually prominent

3. **Content Section Headers** (secondary)
   - Nested within content
   - Smaller and less prominent than page headers

## Mobile Considerations

- On mobile, the app header will remain minimal
- The PageHeader component should adapt its layout for smaller screens
- Actions in PageHeader should stack on mobile when needed

## Expected Outcomes

1. Eliminated duplicate headers and titles throughout the application
2. Clearer visual hierarchy with proper layering of UI elements
3. Improved consistency in header interactions
4. Better space utilization with the streamlined header approach
5. Enhanced responsive behavior for mobile devices
