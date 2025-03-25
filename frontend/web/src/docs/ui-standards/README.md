# Employee Shift Scheduler UI Standards

This document outlines the UI standards for the Employee Shift Scheduler application to ensure consistency across all pages and components.

## Design Principles

1. **Consistency** - Apply consistent spacing, typography, and component usage across all pages
2. **Clarity** - Use clear visual hierarchy and meaningful whitespace
3. **Efficiency** - Design interfaces that minimize user effort and cognitive load
4. **Accessibility** - Ensure all components meet WCAG 2.1 AA standards

## Layout Structure

### Standard Page Layout

Every page should follow this consistent structure:

```
<AppLayout>
  <PageHeader />
  <PageContent>
    <ContentSection />
    <ContentSection />
  </PageContent>
</AppLayout>
```

### Page Header Structure

```
<div className="py-6 px-4 sm:px-6 lg:px-8">
  <div className="mb-6">
    <h1 className="text-3xl font-bold text-primary">{PageTitle}</h1>
    <p className="text-muted-foreground mt-1">{PageDescription}</p>
  </div>
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-4">
      {/* Filters and search components */}
    </div>
    <div className="flex items-center gap-2">
      {/* Action buttons */}
    </div>
  </div>
</div>
```

### Standard Content Section

```
<div className="mb-6">
  <Card>
    <CardHeader>
      <CardTitle>{SectionTitle}</CardTitle>
      <CardDescription>{SectionDescription}</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</div>
```

## Spacing System

Use the following Tailwind spacing classes consistently:

- **Page padding**: `px-4 sm:px-6 lg:px-8 py-6`
- **Section margin**: `mb-6` or `mb-8` for larger sections
- **Card padding**: Use ShadCN defaults
- **Element spacing**: `gap-2` for small related elements, `gap-4` for content blocks, `gap-6` for major sections

## Typography

- **Page titles**: `text-3xl font-bold text-primary`
- **Section titles**: `text-xl font-semibold`
- **Card titles**: Use ShadCN's CardTitle component
- **Body text**: Use default text size with `text-foreground`
- **Secondary text**: `text-sm text-muted-foreground`
- **Tiny text**: `text-xs text-muted-foreground`

## Color Usage

Use the theme colors defined in tailwind.config.js consistently:

- **Primary actions**: `bg-primary text-primary-foreground`
- **Secondary actions**: `bg-secondary text-secondary-foreground`
- **Destructive actions**: `bg-destructive text-destructive-foreground`
- **Backgrounds**: `bg-background` (main), `bg-muted` (secondary), `bg-card` (cards)
- **Text**: `text-foreground` (main), `text-muted-foreground` (secondary)
- **Accents**: Use accent colors for highlighting or emphasizing elements

## Component Standards

### Buttons

- **Primary**: Use for main actions `<Button>Primary</Button>`
- **Secondary**: Use for secondary actions `<Button variant="secondary">Secondary</Button>`
- **Outline**: Use for tertiary actions `<Button variant="outline">Outline</Button>`
- **Destructive**: Use for delete/remove actions `<Button variant="destructive">Delete</Button>`
- **Button with Icon**: Maintain consistent spacing `<Button><Icon className="h-4 w-4 mr-2" />Text</Button>`

### Forms

- Use ShadCN's Form components for all forms
- Maintain consistent spacing between form fields: `space-y-4`
- Use consistent label positioning and styling
- Always use form validation with clear error messages
- Group related fields with appropriate headings

### Cards

- Use ShadCN's Card components consistently
- Maintain consistent internal spacing
- Use CardHeader, CardContent, and CardFooter appropriately
- Apply consistent action placement within cards

### Tables and Lists

- Use DataTable component for complex data
- For simple lists, use consistent List components
- Maintain consistent pagination controls
- Apply consistent empty states
- Use skeleton loaders during data fetching

### Feedback States

- **Loading**: Use ShadCN Skeleton components consistently
- **Empty**: Use consistent empty state messaging and visuals
- **Error**: Use clear error messaging with recovery actions
- **Success**: Provide clear success feedback

## Responsive Design

- Design for mobile-first
- Use breakpoints consistently: sm (640px), md (768px), lg (1024px), xl (1280px)
- Apply consistent responsive patterns for layout changes
- Adjust typography and spacing appropriately for different screen sizes

## Accessibility Standards

- Ensure sufficient color contrast
- Provide text alternatives for non-text content
- Ensure keyboard navigability
- Support screen readers with appropriate ARIA attributes
- Ensure focus states are visible

## Implementation Checklist

When implementing or refactoring UI components, verify:

- [ ] Layout follows standard structure
- [ ] Spacing is consistent with guidelines
- [ ] Typography follows defined standards
- [ ] Colors adhere to the defined palette
- [ ] Components use the appropriate variants
- [ ] Responsive behavior is consistent
- [ ] Accessibility requirements are met
- [ ] Loading, empty, and error states are handled consistently
