# Design System Documentation

This directory contains documentation for our design system implementation using shadcn/ui components with Tailwind CSS.

## Documentation Structure

### Implementation Plan

- [Overview](./overview.md) - Purpose, status tracking, and next actions
- [Implementation Phases](./implementation-phases.md) - The four phases of implementation
- [Implementation Schedule](./implementation-schedule.md) - Timeline and updates
- [Tailwind Guidelines](./tailwind-guidelines.md) - Standards for using Tailwind CSS
- [Sample Implementation](./sample-implementation.md) - Example of proper implementation with before/after comparison
- **[Plan Folder](./plan/)** - Detailed implementation tracking and next tasks
  - **[Start Here](./plan/start-here.md)** - Primary entry point for current status and next tasks

### Audit Process

- [Audit Process](./audit-process.md) - Steps for auditing pages
- [Audit Checklist](./audit-checklist.md) - Detailed checklist for evaluations
- [Audit Template](./audit-template.md) - Template for documenting audit findings
- [Audit Status](./audit-status.md) - Current progress and results of audits
- [Audits Directory](./plan/audits/) - Detailed audit results for each page

### ESLint Rules

- [ESLint Rules Plan](./eslint-rules-plan.md) - Plan for implementing ESLint rules
- [Setup ESLint Rules](./setup-eslint-rules.md) - Instructions for setting up ESLint rules
- [ESLint Implementation Status](./plan/eslint/implementation-status.md) - Detailed tracking of ESLint rules implementation

### Component Guidelines

- [Component Inventory](./component-inventory.md) - Guidelines for UI components
- [Page Structure Guide](./page-structure-guide.md) - Standards for page layout
- [Refactoring Checklist](./refactoring-checklist.md) - Guide for refactoring components

### Workshops & Training

- [Workshop Plans](./plan/workshops/) - Materials for design system training

## Getting Started

For the most up-to-date information on the design system implementation and next steps, start with the [Start Here](./plan/start-here.md) document in the plan folder.

## Implementation Principles

1. Direct use of shadcn/ui components with Tailwind utility classes
2. Consistent spacing using Tailwind's spacing scale
3. Standardized page structure
4. Component consolidation replacing custom wrapper components

## Contributing

When working on the design system:

1. Update the [Start Here](./plan/start-here.md) document as tasks are completed
2. Follow the [Refactoring Checklist](./refactoring-checklist.md) when updating components
3. Document page audits using the [Audit Template](./plan/audits/audit-template.md)
4. Test ESLint rules against existing code before implementation

## Design System Showcase

We've created a visual showcase of all design system components at `/design-system` in the application. This page demonstrates:

- All core components with interactive examples
- Proper implementation patterns
- Component combinations and layout structures
- Responsive behavior of components

This showcase serves as a live reference for developers implementing the design system.

## Core Components (Documented)

We've completed documentation for these key components:

1. **Page Structure Components**:

   - PageHeader - Consistent page titles and actions
   - HeaderContentSpacing - Standardized spacing between elements
   - ContentContainer - Proper content wrapping
   - ContentSection - Logical content grouping

2. **UI Components**:
   - Button - Interactive elements with consistent styling
   - Card - Content containers and grouping
   - EmptyState - Display when no content is available
   - AlertCard - Notification and alert messages
   - ItemCard - Grid and collection item display
   - FormSection - Form field grouping
   - FilterGroup - Organizing filter controls
   - SearchInput - Consistent search functionality
   - LoadingState - Loading indicators and spinners

## Quick Start

To ensure your page follows our design system:

1. Use the standard page structure:

   ```tsx
   <PageHeader title="Page Title" />
   <HeaderContentSpacing type="page">
     <ContentContainer>
       <ContentSection title="Section Title">
         {/* Content */}
       </ContentSection>
     </ContentContainer>
   </HeaderContentSpacing>
   ```

2. Follow the spacing guidelines:

   - Between header and content: `var(--header-content-spacing)`
   - Between sections: `var(--section-content-spacing)`
   - Between section title and content: `var(--section-header-spacing)`

3. Use shadcn/ui components directly when possible
4. Use Tailwind utility classes for minor adjustments

## Implementation Progress

Current progress:

- ✅ All components documented with usage guidelines
- ✅ Design system showcase page created
- ✅ Page structure standards established
- 🟡 Component auditing in progress
- 🟡 ESLint rules for design system enforcement in place
- ⬜️ Page refactoring not yet started

## Using This Documentation

**For Developers:**

1. Review the [Page Structure Guide](./page-structure-guide.md) to understand the standard layout
2. Check [Component Inventory](./component-inventory.md) for usage guidelines on specific components
3. Use the implementation examples for consistent patterns

**For Design System Maintainers:**

1. Update component status in [Implementation Plan](./implementation-plan.md) as tasks are completed
2. Add component usage guidelines to [Component Inventory](./component-inventory.md)
3. Update audit results for pages in [Implementation Plan](./implementation-plan.md)

## Next Steps

See the [Implementation Plan](./implementation-plan.md) for current priorities and next steps.

The immediate focus is on:

1. Refactoring existing pages to follow design system standards
2. Developing guidelines for component combinations and page patterns
3. Planning ESLint rules to enforce design system standards
4. Conducting design system workshop with development team

## Enforcing Standards

We use several mechanisms to enforce design system standards:

1. **Documentation**: Comprehensive guidelines and examples in this documentation
2. **Showcase Page**: Visual reference at `/design-system` in the application
3. **ESLint Rules**: Automated checks that catch design system violations
4. **Code Reviews**: Design system compliance checked during code reviews
5. **Pre-commit Hooks**: Design system checks run before code is committed

See the [ESLint Setup Guide](./setup-eslint-rules.md) for instructions on setting up the automated checks.
