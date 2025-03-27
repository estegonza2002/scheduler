# Page Audit Checklist

Use this checklist when auditing pages to ensure consistent evaluation against our design system standards.

## Page Structure

- [ ] Page header follows the standard pattern using Tailwind classes

  - Consistent heading size (text-2xl)
  - Description text using text-muted-foreground
  - Proper spacing (mb-6)
  - Flex layout for title and actions

- [ ] Clear visual hierarchy with proper heading elements (h1, h2, h3)

  - h1 for page title
  - h2 for section titles
  - h3 for subsections

- [ ] Consistent spacing between page sections using Tailwind space-y-\* classes

  - space-y-6 for major sections
  - space-y-4 for content within sections

- [ ] No custom wrapper components used
  - No PageHeader component
  - No ContentContainer component
  - No ContentSection component
  - No HeaderContentSpacing component

## Component Usage

- [ ] Using shadcn/ui Card components directly for content sections

  - Proper Card, CardHeader, CardContent structure
  - CardTitle and CardDescription for headings

- [ ] Button components follow the design system guidelines

  - Limited use of primary variant
  - Consistent sizing for similar actions
  - Proper variant selection based on action type

- [ ] Form elements use proper shadcn/ui components

  - Label + Input combinations
  - FormItem + FormLabel + FormControl pattern
  - Consistent field spacing

- [ ] Modals/dialogs use shadcn/ui Dialog components
  - DialogContent for content container
  - DialogHeader for headings
  - DialogFooter for actions

## Spacing & Layout

- [ ] Consistent spacing using Tailwind's scale

  - my-6 for major sections
  - p-4 for content padding
  - gap-2 for related elements

- [ ] No custom CSS files or inline styles for basic layout

  - No custom CSS variables for spacing
  - No inline style attributes for spacing/layout

- [ ] Responsive layout using Tailwind's responsive utilities

  - sm:, md:, lg: prefixes for responsive adjustments
  - Proper grid/flex layouts for different screen sizes

- [ ] Content container widths are consistent with design system
  - max-w-7xl for full-width content
  - max-w-4xl for narrower content sections

## Typography & Visual Style

- [ ] Heading sizes follow the design system

  - text-2xl for page titles
  - text-xl for section titles
  - text-lg for subsection titles

- [ ] Text colors use Tailwind's theme colors

  - text-muted-foreground for secondary text
  - text-destructive for error messages
  - Default text color for primary content

- [ ] Consistent font weights using Tailwind utilities

  - font-bold for page titles
  - font-semibold for section headings
  - font-medium for emphasized text

- [ ] Proper use of shadcn's semantic color variables
  - background, foreground
  - primary, primary-foreground
  - card, card-foreground
