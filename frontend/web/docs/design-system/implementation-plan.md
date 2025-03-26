# Design System Implementation Plan

## Overview

This document outlines the plan to ensure consistent look and feel across all content areas of the application using shadcn/ui components. The goal is to maintain consistency while leveraging pre-built functionality without unnecessary custom CSS.

## Status Tracking

Each task has a status indicator:

- ⬜️ Not Started
- 🟡 In Progress
- 🟢 Completed
- 🔴 Blocked

## Phase 1: Documentation & Standards

### Component Usage Guide

- 🟢 Document all core shadcn/ui components currently in use
- 🟢 Define when/how to use each component type
- 🟢 Create examples for content layouts, forms, and data displays

### Content Area Structure Standards

- 🟢 Establish page layout hierarchy (PageHeader → ContentContainer → ContentSection)
- 🟢 Document spacing rules between components
- 🟢 Define card vs. flat layouts usage criteria

## Phase 2: Content Area Audit

### Page Structure Review

- 🟡 Audit existing pages against standards
- 🟡 Identify inconsistent implementations
- 🟡 Create prioritized list of pages needing alignment

### Component Usage Audit

- 🟡 Check for non-standard component implementations
- 🟡 Identify duplicate/custom components that could use shadcn/ui
- ⬜️ Document areas where spacing is inconsistent

## Phase 3: Implementation & Refactoring

### Standardize Page Layouts

- ⬜️ Refactor pages to use PageHeader consistently
- ⬜️ Implement ContentContainer for all main content areas
- ⬜️ Convert content blocks to ContentSection components

### Spacing Standardization

- ⬜️ Apply header-spacing variables consistently
- ⬜️ Implement HeaderContentSpacing where appropriate
- ⬜️ Standardize padding/margins on all content areas

### Component Consolidation

- ⬜️ Replace custom components with shadcn/ui where possible
- ⬜️ Ensure consistent props usage across similar components
- ⬜️ Standardize modal/dialog implementations

## Phase 4: Validation & Enforcement

### Design System Linting

- 🟡 Create ESLint rules for component usage
- 🟡 Set up pre-commit hooks to check compliance
- ⬜️ Add warnings for non-standard spacing values

### Component Showcase

- 🟢 Create internal design system page
- 🟢 Document all standard content layouts
- 🟢 Provide copy/paste examples for developers

## Documentation Resources

- ✅ [Component Inventory](./component-inventory.md): Lists all UI components with usage guidelines
- ✅ [Page Structure Guide](./page-structure-guide.md): Standards for consistent page layout
- ✅ [Refactoring Checklist](./refactoring-checklist.md): Step-by-step guide for refactoring components
- ✅ Component Showcase Page: Visual examples of all design system patterns

## Next Actions

1. ✅ Completed
2. ✅ Completed
3. ✅ Completed
4. 🟡 Continue implementing ESLint rules for design system - proof of concept for five key rules created
5. Conduct design system workshop with development team to demo the showcase page
6. 🟡 Audit additional pages for design system compliance

## Sample Implementation

Below is a standardized implementation example that follows all our design system guidelines:

```tsx
// src/pages/SampleStandardPage.tsx
import { Button } from "../components/ui/button";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { HeaderContentSpacing } from "../components/ui/header-content-spacing";
import { PageHeader } from "../components/ui/page-header";

export function SampleStandardPage() {
	return (
		<>
			<PageHeader
				title="Sample Page"
				description="A standardized page following design system guidelines"
				actions={<Button size="sm">Primary Action</Button>}
			/>

			<HeaderContentSpacing type="page">
				<ContentContainer>
					<ContentSection
						title="Main Content"
						description="This section demonstrates proper content structuring"
						headerActions={
							<Button
								variant="outline"
								size="sm">
								Section Action
							</Button>
						}>
						{/* Section content goes here */}
						<p>
							Content follows spacing guidelines and uses shadcn/ui components
							directly.
						</p>
					</ContentSection>

					<ContentSection
						title="Secondary Content"
						flat={true}>
						{/* Flat section content */}
						<p>
							This section uses the flat variant for less visual separation.
						</p>
					</ContentSection>
				</ContentContainer>
			</HeaderContentSpacing>
		</>
	);
}
```

## Core Component Documentation Progress

We've completed documentation for the following key components:

1. **Page Structure Components**:

   - ✅ PageHeader - Provides consistent page titles and actions
   - ✅ HeaderContentSpacing - Ensures proper spacing between headers and content
   - ✅ ContentContainer - Standardizes content wrapping and padding
   - ✅ ContentSection - Groups content with consistent styling

2. **UI Components**:
   - ✅ Button - Primary interaction elements
   - ✅ Card - Content containers with consistent styling
   - ✅ EmptyState - Display when no content is available
   - ✅ AlertCard - Notification and alert messages
   - ✅ ItemCard - Grid and collection item display
   - ✅ FormSection - Form field grouping

## Notes & Updates

- 2023-08-10 - Initial plan created
- 2023-08-10 - Completed page structure guidelines in page-structure-guide.md
- 2023-08-10 - Started documenting component usage guidelines
- 2023-08-10 - Documented Button and ContentSection components
- 2023-08-10 - Completed sample page audit for LocationInsights.tsx
- 2023-08-10 - Documented Card, ContentContainer, PageHeader, and HeaderContentSpacing components
- 2023-08-10 - Created Refactoring Checklist document
- 2023-08-11 - Documented EmptyState component
- 2023-08-11 - Documented AlertCard component
- 2023-08-11 - Documented ItemCard component
- 2023-08-11 - Refactored LocationInsights.tsx to follow design system standards
- 2023-08-11 - Documented FormSection component
- 2023-08-12 - Documented FilterGroup, SearchInput, and LoadingState components
- 2023-08-12 - Created design system showcase page
- 2023-08-12 - Conducted audit of LocationFinancialReport.tsx
- 2023-08-12 - Refactored LocationFinancialReport.tsx to follow design system standards
- 2023-08-13 - Created ESLint rules plan with detailed approach
- 2023-08-13 - Implemented ESLint rules for PageHeader, HeaderContentSpacing, and Card usage
- 2023-08-13 - Created pre-commit hook for validating design system compliance
- 2023-08-13 - Added documentation for ESLint plugin usage and rule descriptions
- 2023-08-14 - Audited ShiftCreationForm.tsx component for design system compliance
- 2023-08-14 - Added enforce-form-section ESLint rule to ensure forms use FormSection components
- 2023-08-14 - Refactored ShiftCreationForm.tsx to follow design system standards by replacing Card with ContentSection and adding ContentContainer
- 2023-08-15 - Audited and refactored EmployeesPage.tsx to follow design system standards by adding HeaderContentSpacing and ContentSection
- 2023-08-15 - Added enforce-card-grid-section ESLint rule to ensure card grids are wrapped in ContentSection

## Page Audit Results

| Page                                      | Status       | Issues                                                                                                          | Priority |
| ----------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------- | -------- |
| src/components/LocationInsights.tsx       | 🟢 Completed | - ✅ Added ContentContainer<br>- ✅ Fixed spacing<br>- ✅ Using ContentSection                                  | High     |
| src/pages/LocationFinancialReportPage.tsx | 🟢 Completed | - ✅ Added HeaderContentSpacing<br>- ✅ Using ContentSection<br>- ✅ Fixed card & button styling                | Medium   |
| src/components/ShiftCreationForm.tsx      | 🟢 Completed | - ✅ Already using FormSection<br>- ✅ Added ContentContainer wrapper<br>- ✅ Replaced Card with ContentSection | Medium   |
| src/pages/EmployeesPage.tsx               | 🟢 Completed | - ✅ Added HeaderContentSpacing<br>- ✅ Added ContentSection<br>- ✅ Improved component hierarchy               | Medium   |

## Component Audit Results

| Component            | Status        | Issues                     | Priority |
| -------------------- | ------------- | -------------------------- | -------- |
| ContentSection       | 🟢 Documented | Usage guidelines completed | High     |
| Button               | 🟢 Documented | Usage guidelines completed | High     |
| Card                 | 🟢 Documented | Usage guidelines completed | High     |
| ContentContainer     | 🟢 Documented | Usage guidelines completed | High     |
| PageHeader           | 🟢 Documented | Usage guidelines completed | High     |
| HeaderContentSpacing | 🟢 Documented | Usage guidelines completed | High     |
| EmptyState           | 🟢 Documented | Usage guidelines completed | Medium   |
| AlertCard            | 🟢 Documented | Usage guidelines completed | Medium   |
| ItemCard             | 🟢 Documented | Usage guidelines completed | Medium   |
| FormSection          | 🟢 Documented | Usage guidelines completed | Medium   |
| FilterGroup          | 🟢 Documented | Usage guidelines completed | Medium   |
| SearchInput          | 🟢 Documented | Usage guidelines completed | Medium   |
| LoadingState         | 🟢 Documented | Usage guidelines completed | Medium   |

## Implementation Schedule

### Week 1: Documentation & Auditing (Current)

- ✅ Create design system documentation structure
- ✅ Document key components (Button, Card, ContentSection, etc.)
- ✅ Create refactoring checklist for developers
- 🟡 Audit existing pages for inconsistencies
- ✅ Finalize EmptyState component documentation
- ✅ Document AlertCard component
- ✅ Document ItemCard component
- ✅ Document FormSection component
- ✅ Document FilterGroup component
- ✅ Document SearchInput component
- ✅ Document LoadingState component
- ✅ Create design system showcase page

### Week 2: Refactoring High-Priority Components

- ✅ Refactor LocationInsights.tsx as a proof of concept
- ✅ Refactor LocationFinancialReport.tsx based on audit results
- ⬜️ Create reusable code snippets for VSCode
- ⬜️ Audit ShiftCreationForm.tsx

### Week 3: Standardization & Validation

- ⬜️ Implement ESLint rules for design system compliance
- ⬜️ Create internal design system showcase
- ⬜️ Document all refactoring patterns
