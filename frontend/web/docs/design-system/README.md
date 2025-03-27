# Design System Documentation

This directory contains documentation for our design system implementation using shadcn/ui components with Tailwind CSS.

## Documentation Structure

### Implementation Guidelines

- [Tailwind Guidelines](./guidelines/tailwind-guidelines.md) - Standards for using Tailwind CSS
- [Page Structure Guide](./guidelines/page-structure-guide.md) - Standards for consistent page layout

### Component Guidelines

- [Component Inventory](./components/component-inventory.md) - Guidelines for UI components

## Implementation Principles

1. Direct use of shadcn/ui components with Tailwind utility classes
2. Consistent spacing using Tailwind's spacing scale
3. Standardized page structure
4. Component consolidation replacing custom wrapper components

## Getting Started

To implement the design system in your page:

1. Follow the [Page Structure Guide](./guidelines/page-structure-guide.md) to understand the standard layout
2. Check [Component Inventory](./components/component-inventory.md) for usage guidelines on specific components
3. Use the [Tailwind Guidelines](./guidelines/tailwind-guidelines.md) for consistent styling

## Core Components

1. **Page Structure Components**:

   - PageHeader - Consistent page titles and actions
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
   <ContentContainer>
     <ContentSection title="Section Title">
       {/* Content */}
     </ContentSection>
   </ContentContainer>
   ```

2. Follow the spacing guidelines in the Tailwind Guidelines document
3. Use shadcn/ui components directly when possible
4. Use Tailwind utility classes for minor adjustments

## Common Patterns

See the Page Structure Guide for detailed examples of standard page layouts, including:

- Basic page layout
- Page with tabs
- Page with secondary navigation
- Form page layout
