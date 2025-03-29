# UI Component Inventory

## Overview

This document tracks all shadcn/ui components currently in use and provides guidance on their proper usage to maintain consistency.

## Base Components

| Component | File Location                | Usage                       | Status                    |
| --------- | ---------------------------- | --------------------------- | ------------------------- |
| Button    | src/components/ui/button.tsx | Primary interaction element | 🟢 Documented             |
| Card      | src/components/ui/card.tsx   | Content containers          | 🟢 Documented             |
| Dialog    | src/components/ui/dialog.tsx | Modal interactions          | ⬜️ Need usage guidelines |
| Form      | src/components/ui/form.tsx   | Data collection             | ⬜️ Need usage guidelines |
| Input     | src/components/ui/input.tsx  | Text entry                  | ⬜️ Need usage guidelines |
| Select    | src/components/ui/select.tsx | Option selection            | ⬜️ Need usage guidelines |
| Sheet     | src/components/ui/sheet.tsx  | Side panels                 | ⬜️ Need usage guidelines |
| Tabs      | src/components/ui/tabs.tsx   | Content grouping            | ⬜️ Need usage guidelines |
| Table     | src/components/ui/table.tsx  | Data display                | ⬜️ Need usage guidelines |
| Alert     | src/components/ui/alert.tsx  | User notifications          | ⬜️ Need usage guidelines |
| Toast     | src/components/ui/toast.tsx  | Temporary notifications     | ⬜️ Need usage guidelines |
| Avatar    | src/components/ui/avatar.tsx | User representations        | ⬜️ Need usage guidelines |
| Badge     | src/components/ui/badge.tsx  | Status indicators           | ⬜️ Need usage guidelines |

## Custom Components

| Component            | File Location                                | Purpose                   | Status        |
| -------------------- | -------------------------------------------- | ------------------------- | ------------- |
| ContentContainer     | src/components/ui/content-container.tsx      | Page content wrapper      | 🟢 Documented |
| ContentSection       | src/components/ui/content-section.tsx        | Content grouping          | 🟢 Documented |
| PageHeader           | src/components/ui/page-header.tsx            | Page heading and actions  | 🟢 Documented |
| HeaderContentSpacing | src/components/ui/header-content-spacing.tsx | Consistent spacing        | 🟢 Documented |
| EmptyState           | src/components/ui/empty-state.tsx            | Empty data indicators     | 🟢 Documented |
| AlertCard            | src/components/ui/alert-card.tsx             | Highlighted notifications | 🟢 Documented |
| ItemCard             | src/components/ui/item-card.tsx              | List item display         | 🟢 Documented |
| FormSection          | src/components/ui/form-section.tsx           | Form grouping             | 🟢 Documented |
| FilterGroup          | src/components/ui/filter-group.tsx           | Filter controls           | 🟢 Documented |
| SearchInput          | src/components/ui/search-input.tsx           | Search functionality      | 🟢 Documented |
| LoadingState         | src/components/ui/loading-state.tsx          | Loading indicators        | 🟢 Documented |

## Usage Guidelines Template

### [Component Name]

**Purpose:**

- Primary use case

**When to use:**

- Specific scenarios for this component

**Variants:**

- Available variations

**Proper implementation:**

```tsx
// Example code
```

**Do:**

- Best practices

**Don't:**

- Anti-patterns to avoid

**Spacing guidelines:**

- How to maintain proper spacing

---

## Component Documentation

### Button

**Purpose:**

- Primary interactive element for user actions
- Provides consistent styling for all clickable actions in the application

**When to use:**

- For all interactive elements that trigger an action
- When users need to submit forms, navigate, or trigger functionality

**Variants:**

- `default`: Primary actions (blue background)
- `destructive`: Delete or dangerous actions (red background)
- `outline`: Secondary actions with a border
- `secondary`: Alternative actions (gray background)
- `ghost`: Subtle actions without background
- `link`: Text-only actions that look like links

**Sizes:**

- `default`: Standard size for most buttons
- `sm`: Smaller buttons for compact UIs
- `lg`: Larger buttons for emphasis
- `icon`: Square buttons for icon-only actions

**Proper implementation:**

```tsx
// Primary button
<Button>Save Changes</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Outline button
<Button variant="outline">Cancel</Button>

// Secondary button
<Button variant="secondary">Filter</Button>

// Small ghost button
<Button variant="ghost" size="sm">View Details</Button>

// Link button
<Button variant="link">Learn more</Button>

// Icon button
<Button variant="outline" size="icon">
  <PlusIcon className="h-4 w-4" />
</Button>

// Disabled button
<Button disabled>Processing...</Button>

// With loading state
<Button disabled>
  <LoadingSpinner className="mr-2 h-4 w-4" />
  Saving
</Button>
```

**Do:**

- Use the default variant for primary actions (main action on page)
- Use destructive for actions that delete or have permanent consequences
- Group related buttons with consistent spacing
- Use icon buttons (size="icon") for icon-only buttons
- Include a text label for clarity when appropriate

**Don't:**

- Mix too many button variants in the same context
- Use destructive variant for non-destructive actions
- Override button styling directly (use variants instead)
- Place buttons without sufficient spacing between them
- Use multiple primary (default variant) buttons in one section

**Button Hierarchy Guidelines:**

1. Each section should have at most one default (primary) button
2. Use secondary or outline buttons for secondary actions
3. Use ghost buttons for tertiary actions
4. Use link buttons only for navigation or help content

**Placement Guidelines:**

- Form actions: Primary button on right, secondary/cancel on left
- Dialog actions: Primary button on right, close/cancel on left
- Page actions: Align to the right in PageHeader
- Section actions: Align to the right in ContentSection header

### Card

**Purpose:**

- Container for grouping related content with a consistent visual style
- Provides visual separation between distinct content areas

**When to use:**

- When you need to visually separate content groups
- For individual items in a collection or grid layout
- When content needs a distinct boundary and background

**Sub-components:**

- `Card`: The main container component
- `CardHeader`: Container for the title and description area
- `CardTitle`: Card heading text
- `CardDescription`: Secondary text below the title
- `CardContent`: Main content area of the card
- `CardFooter`: Optional area for actions or summary information

**Proper implementation:**

```tsx
// Basic Card
<Card>
  <CardContent>
    <p>Simple card with just content</p>
  </CardContent>
</Card>

// Complete Card with all sub-components
<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Continue</Button>
  </CardFooter>
</Card>

// Card in a grid layout
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>
    <CardHeader>
      <CardTitle>Item 1</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Content for item 1</p>
    </CardContent>
  </Card>
  {/* More cards... */}
</div>
```

**Do:**

- Use the complete Card component hierarchy (Card → CardHeader → CardTitle, etc.)
- Maintain consistent spacing within cards
- Use consistent heading sizes across similar cards
- Group related actions in CardFooter
- Consider using ContentSection instead when content needs a title and has additional styling needs

**Don't:**

- Nest cards directly within other cards
- Use cards for entire page layouts (use ContentSection instead)
- Mix different card styles in the same container
- Override the basic card styling with custom shadows or borders
- Use inconsistent spacing between cards in a collection

**Content Guidelines:**

- Always include a clear title for context when using CardHeader
- Keep card content focused on a single concern or data group
- Use CardDescription for additional context, not for core content
- Place primary actions in CardFooter, aligned to the right

**Spacing Guidelines:**

- Maintain consistent padding within card components
- Use consistent gap spacing (typically 16px/1rem) between cards in a grid
- Ensure CardHeader, CardContent, and CardFooter have appropriate internal spacing

### ContentContainer

**Purpose:**

- Provides a consistent wrapper for page content
- Standardizes horizontal padding and maximum width for content areas
- Ensures content is properly contained within the viewport

**When to use:**

- For all main content areas of pages
- To maintain consistent padding across the application
- When you need to contain multiple ContentSection components

**Props:**

- `children`: The content to display within the container
- `className`: Optional additional className for the container
- `maxWidth`: Optional maximum width for the container (default: "w-full")
- `withPadding`: Whether to apply default padding (default: true)

**Proper implementation:**

```tsx
// Basic usage
<ContentContainer>
  <ContentSection title="Section Title">
    {/* Section content */}
  </ContentSection>
</ContentContainer>

// With custom maximum width
<ContentContainer maxWidth="max-w-4xl">
  {/* Content with constrained width */}
</ContentContainer>

// Without default padding (for custom layouts)
<ContentContainer withPadding={false}>
  {/* Content that needs custom padding */}
</ContentContainer>

// With secondary navigation
<div className="flex">
  <div className="secondary-navbar">
    {/* Secondary navigation */}
  </div>
  <ContentContainer className="main-with-secondary-expanded">
    {/* Main content */}
  </ContentContainer>
</div>
```

**Do:**

- Always wrap main page content in a ContentContainer
- Use ContentContainer directly after HeaderContentSpacing component
- Use the maxWidth prop for specialized content that needs width constraints
- Keep the withPadding prop as true in most cases

**Don't:**

- Skip ContentContainer in the page structure
- Apply inconsistent padding or margins directly to content that should be in a container
- Use ContentContainer for modal or dialog content (they have their own containers)
- Nest ContentContainer components

**Layout Guidelines:**

- ContentContainer should be used directly after PageHeader and HeaderContentSpacing
- ContentSection components should be direct children of ContentContainer
- When using with secondary navigation, apply appropriate margin classes (main-with-secondary-expanded or main-with-secondary-minimized)

**Relationship with other components:**

- PageHeader → HeaderContentSpacing → ContentContainer → ContentSection

### HeaderContentSpacing

**Purpose:**

- Provides consistent vertical spacing between headers and content
- Ensures proper spacing rhythm across the application
- Uses standardized spacing variables for consistency

**When to use:**

- After page headers to maintain consistent spacing before content
- Between section headers and their content
- Between content blocks that need standard spacing

**Props:**

- `children`: Content to be displayed with standardized spacing
- `type`: The type of spacing to apply (page, section, or content)
- `className`: Optional additional className

**Types:**

- `page`: Spacing after a page header (default)
- `section`: Spacing after a section header
- `content`: Spacing between content blocks

**Proper implementation:**

```tsx
// After page header (standard usage)
<PageHeader title="Page Title" />
<HeaderContentSpacing type="page">
  <ContentContainer>
    {/* Page content */}
  </ContentContainer>
</HeaderContentSpacing>

// After section header
<h2 className="text-xl font-semibold">Section Title</h2>
<HeaderContentSpacing type="section">
  {/* Section content */}
</HeaderContentSpacing>

// Between content blocks
<p>First content block</p>
<HeaderContentSpacing type="content">
  <p>Second content block with standard spacing above</p>
</HeaderContentSpacing>
```

**Do:**

- Use consistently after page headers
- Apply the appropriate type based on the context
- Wrap the content in the HeaderContentSpacing component
- Use the standard page layout pattern: PageHeader → HeaderContentSpacing → ContentContainer

**Don't:**

- Skip this component in the standard page structure
- Use custom margins instead of this component for standard spacing
- Nest HeaderContentSpacing components
- Use inconsistent spacing values throughout the application

**CSS Variables:**

- The component uses the following CSS variables from header-spacing.css:
  - `--header-content-spacing`: 24px (standard spacing after page headers)
  - `--section-header-spacing`: 16px (spacing after section headers)
  - `--section-content-spacing`: 16px (spacing between content blocks)

**Layout Guidelines:**

- Always include HeaderContentSpacing after PageHeader
- Maintain the standard component hierarchy: PageHeader → HeaderContentSpacing → ContentContainer
- For custom layouts, still use the appropriate HeaderContentSpacing type to maintain consistent vertical rhythm

### PageHeader

**Purpose:**

- Provides consistent page titles and navigation elements
- Serves as the primary header for all pages in the application
- Combines navigation controls with page-specific actions

**When to use:**

- For all top-level pages and significant sub-pages
- When users need clear context about their current location
- When page-specific actions need to be prominently displayed

**Props:**

- `title`: The title of the page (required)
- `description`: Optional description text to display under the title
- `actions`: Optional action buttons to display in the header
- `className`: Optional additional className for the header container
- `titleClassName`: Optional additional className for the title text
- `descriptionClassName`: Optional additional className for the description text
- `actionsClassName`: Optional additional className for the actions container
- `showBackButton`: Whether to show the back button (default: true)

**Proper implementation:**

```tsx
// Basic usage
<PageHeader title="Employees" />

// With description
<PageHeader
  title="Employee Details"
  description="View and edit employee information"
/>

// With actions
<PageHeader
  title="Locations"
  actions={
    <Button size="sm">Add Location</Button>
  }
/>

// Complete example
<PageHeader
  title="Location Management"
  description="Manage all company locations"
  actions={
    <div className="flex gap-2">
      <Button variant="outline" size="sm">Import</Button>
      <Button size="sm">Add Location</Button>
    </div>
  }
  showBackButton={true}
/>
```

**Do:**

- Include a clear, descriptive title that identifies the current page
- Keep the page title concise (ideally 1-3 words)
- Use the description for additional context when needed
- Limit actions to 1-3 primary actions for the current page
- Use the showBackButton prop appropriately based on navigation depth

**Don't:**

- Include long titles that might wrap on smaller screens
- Place too many actions in the header (use ContentSection headerActions for section-specific actions)
- Override the default styling of the PageHeader
- Skip PageHeader in the page layout structure
- Create custom header implementations when PageHeader can be used

**Back Button Logic:**

- The back button automatically displays on all pages except those defined as top-level pages
- Top-level pages (like Dashboard, Employees, Locations) do not show the back button
- Override this behavior when needed with the showBackButton prop

**Layout Guidelines:**

- PageHeader should always be at the top of the page content
- Follow PageHeader with HeaderContentSpacing component
- Maintain consistent spacing between the header and the first content section
- The standard page structure is: PageHeader → HeaderContentSpacing → ContentContainer → ContentSection

### ContentSection

**Purpose:**

- Groups related content into distinct sections with consistent styling
- Provides a standard way to display section titles, descriptions, and optional header actions

**When to use:**

- When dividing page content into logical sections
- When content needs a title and optional description
- When you need actions associated with a specific content group

**Variants:**

- Card layout (default): Renders content in a shadcn/ui Card component
- Flat layout (`flat={true}`): Renders content without Card styling

**Proper implementation:**

```tsx
// Basic usage
<ContentSection title="Section Title">
  {/* Section content */}
</ContentSection>

// With all options
<ContentSection
  title="Section Title"
  description="Optional description text"
  headerActions={<Button>Action</Button>}
  className="custom-class"
  contentClassName="content-custom-class"
  flat={false}
>
  {/* Section content */}
</ContentSection>

// Flat variant
<ContentSection
  title="Flat Section"
  flat={true}
>
  {/* Content without card styling */}
</ContentSection>
```

**Do:**

- Use for all logical content groupings
- Keep title concise and descriptive
- Use the description for additional context when needed
- Use `headerActions` for actions specific to this section

**Don't:**

- Create custom section layouts when ContentSection can be used
- Nest ContentSection components directly (separate with appropriate spacing)
- Use inconsistent title sizes or weights

**Spacing guidelines:**

- Use `var(--section-content-spacing)` (16px) between the section title area and content
- Leave `var(--section-content-spacing)` (16px) between successive ContentSection components

### EmptyState

**Purpose:**

- Provides a standardized way to display empty states when no data is available
- Creates a consistent user experience for zero-data scenarios
- Guides users on how to proceed when no content exists

**When to use:**

- When a list, table, or content area has no data to display
- When search or filter results return no matches
- When a user needs to create their first item in a collection
- When an error prevents data from loading

**Variants:**

- `size`: Controls the overall component sizing
  - `small`: Compact version for inline or nested empty states
  - `default`: Standard size for most empty states
  - `large`: Expanded version for primary content areas

**Proper implementation:**

```tsx
// Basic empty state
<EmptyState
  title="No data available"
  description="There are no items to display at this time."
/>

// With custom icon and action
<EmptyState
  title="No organizations found"
  description="Create your first organization to get started"
  icon={<Building2 className="h-6 w-6" />}
  action={
    <Button onClick={() => setCreateOrgOpen(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Create Organization
    </Button>
  }
/>

// Small size variant
<EmptyState
  title="No results"
  description="Try adjusting your search terms"
  icon={<Search className="h-5 w-5" />}
  size="small"
/>

// Large size variant for main content areas
<EmptyState
  title="No shifts scheduled"
  description="There are no shifts scheduled for this period"
  icon={<Calendar className="h-8 w-8" />}
  action={<Button onClick={() => window.location.reload()}>Refresh</Button>}
  size="large"
/>
```

**Do:**

- Use clear, concise title text that explains what's missing
- Provide a helpful description that explains why content is missing
- Include an action button when there's a clear next step for the user
- Use appropriate icon that represents the missing content type
- Match the size variant to the content area's importance

**Don't:**

- Use negative or error-focused language unless an actual error occurred
- Omit a description when additional context would help the user
- Use inconsistent styling between different empty states in the application
- Overload the empty state with multiple actions or complex content

**Placement Guidelines:**

- Center the empty state in the available content space
- Use the `default` size for most content areas
- Use the `small` size for nested content sections, data tables, or sidebars
- Use the `large` size for primary content areas when it's the main focus

**Spacing Guidelines:**

- The component has built-in padding that adapts based on the size prop:
  - `small`: 16px (p-4)
  - `default`: 32px (p-8)
  - `large`: 48px (p-12)
- When placing inside a ContentContainer or ContentSection, no additional padding is needed

### AlertCard

**Purpose:**

- Display important messages that require user attention or acknowledgment
- Provide consistent styling for notifications, warnings, errors, and success messages
- Create visually distinctive notifications based on severity or message type

**When to use:**

- For notifying users about important system status changes
- When displaying errors that occurred during an operation
- For warning users about potential issues or consequences
- To confirm successful completion of significant operations
- As inline contextual help or important notes

**Variants:**

- `info` (default): For informational messages that don't require immediate action
- `warning`: For alerting users to potential issues or required attention
- `error`: For displaying error states or failed operations
- `success`: For confirming successful completion of operations

**Proper implementation:**

```tsx
// Basic info alert
<AlertCard
  title="Update Available"
  description="A new version of the application is available."
/>

// Warning alert with action button
<AlertCard
  variant="warning"
  title="Unsaved Changes"
  description="You have unsaved changes that will be lost if you navigate away."
  action={<Button variant="outline">Save Changes</Button>}
/>

// Error alert
<AlertCard
  variant="error"
  title="Failed to load data"
  description="There was an error retrieving your information. Please try again."
  action={
    <Button
      variant="outline"
      onClick={() => window.location.reload()}>
      Retry
    </Button>
  }
/>

// Success alert with dismiss option
<AlertCard
  variant="success"
  title="Profile Updated"
  description="Your profile information has been successfully updated."
  dismissible
  onDismiss={() => console.log('Alert dismissed')}
/>

// Alert with custom icon
<AlertCard
  title="Maintenance Notice"
  description="Scheduled maintenance will occur on Saturday at 2am."
  icon={<Clock className="h-5 w-5" />}
/>
```

**Do:**

- Use the appropriate variant based on the message's importance and context
- Keep title text concise (1-5 words) and action-oriented
- Provide clear, specific descriptions that explain what happened and what to do next
- Include an action button for alerts that require user response
- Use dismissible option for non-critical alerts that users might want to hide

**Don't:**

- Overuse alerts, especially error and warning variants, to avoid alert fatigue
- Stack multiple alerts of the same type in sequence
- Use alerts for standard instructional content that isn't time-sensitive
- Make descriptions overly technical unless appropriate for the user audience
- Place multiple action buttons within a single alert

**Placement Guidelines:**

- Position important system-wide alerts at the top of the page or content area
- For contextual alerts, place them directly above or below the related content
- In forms, place validation alerts immediately after form fields or at form top/bottom
- Use subtle animations (fade-in) when dynamically showing alerts
- Allow sufficient white space around alerts to visually separate them from content

**Spacing Guidelines:**

- The component has built-in padding (p-4)
- Leave 16px (1rem) margin between stacked alerts
- When placing inside a ContentContainer or ContentSection, no additional padding is needed

### ItemCard

**Purpose:**

- Display items in a consistent card format for collections and grid layouts
- Provide standard presentation for list items with images, icons, or avatars
- Support selection states and interactive behavior for item collections

**When to use:**

- When displaying items in a grid or list that need consistent styling
- For collections where items have titles, optional descriptions, and visual elements
- When items need to be selectable or clickable
- For dashboard items, location cards, employee cards, or any collection of similar content

**Variants:**

- Standard: Default card styling with optional image header
- Selectable: Cards that can be selected (`selectable={true}`)
- Interactive: Cards with click behavior (`onClick` provided)
- With badge: Cards with a badge displayed in the top-right corner

**Proper implementation:**

```tsx
// Basic card with title and description
<ItemCard
  title="Location Name"
  description="123 Main Street, City, State"
/>

// With image
<ItemCard
  title="Product Name"
  description="Product description text"
  image="/path/to/image.jpg"
/>

// With icon (when no image is available)
<ItemCard
  title="Settings"
  description="Application settings"
  icon={<Settings className="h-4 w-4" />}
/>

// With initials avatar
<ItemCard
  title="John Smith"
  description="Employee"
  initials="JS"
/>

// With metadata
<ItemCard
  title="Sales Report"
  description="Monthly overview"
  icon={<BarChart className="h-4 w-4" />}
  metadata={
    <div className="flex items-center gap-2">
      <Calendar className="h-3 w-3" />
      <span>Last updated: Yesterday</span>
    </div>
  }
/>

// With actions in footer
<ItemCard
  title="Project Alpha"
  description="Client project"
  actions={
    <>
      <Button variant="outline" size="sm">Edit</Button>
      <Button size="sm">View</Button>
    </>
  }
/>

// Selectable card
<ItemCard
  title="Option 1"
  description="Select this option"
  selectable={true}
  selected={selectedId === "option1"}
  onClick={() => setSelectedId("option1")}
/>

// With badge
<ItemCard
  title="New Feature"
  description="Feature description"
  badge={<Badge>New</Badge>}
/>

// Complete example with all props
<ItemCard
  title="Location Name"
  description="Main office location"
  image="/locations/office.jpg"
  metadata={<div>5 employees assigned</div>}
  actions={
    <>
      <Button variant="outline" size="sm">Edit</Button>
      <Button size="sm">Details</Button>
    </>
  }
  onClick={() => openLocationDetails(id)}
  badge={<Badge variant="success">Active</Badge>}
>
  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
    <div className="flex items-center gap-1">
      <User className="h-3 w-3" />
      <span>5 Employees</span>
    </div>
    <div className="flex items-center gap-1">
      <CalendarIcon className="h-3 w-3" />
      <span>20 Shifts</span>
    </div>
  </div>
</ItemCard>
```

**Do:**

- Use consistent image aspect ratios across similar card collections
- Keep title and description text concise to avoid overflow
- Use the `onClick` handler for the entire card when the primary action is to view details
- Use the `actions` prop for multiple action buttons that need individual click handling
- Consider using a grid layout with responsive columns for card collections

**Don't:**

- Mix different CardItem styles within the same grid or collection
- Use inconsistent image sizes or aspect ratios
- Overload cards with too many actions in the footer
- Use excessively long titles or descriptions that will wrap or truncate
- Make selected state unclear by using similar colors for selected and hover states

**Grid Layout Guidelines:**

For collections of ItemCards, use consistent grid layouts:

```tsx
// Responsive grid layout
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
	{items.map((item) => (
		<ItemCard
			key={item.id}
			title={item.name}
			description={item.description}
			// other props...
		/>
	))}
</div>
```

**Spacing Guidelines:**

- The component has built-in padding for content areas
- Use consistent gap spacing (16px/1rem recommended) between cards in a grid
- When placing inside a ContentSection, no additional padding is needed

### FormSection

**Purpose:**

- Group related form fields into logical sections
- Provide consistent styling and spacing for form organization
- Create a clear visual hierarchy within forms

**When to use:**

- When dividing a form into logical groups of related fields
- For creating multi-part forms with clear sections
- When form fields need descriptive headings and context
- In settings pages, profile forms, or any complex data entry interface

**Props:**

- `title`: The heading for the form section
- `description`: Optional description text to provide additional context
- `children`: The form fields and content
- `className`: Optional additional className for the container
- `contentClassName`: Optional additional className for the content area
- `titleClassName`: Optional additional className for the title
- `descriptionClassName`: Optional additional className for the description
- `id`: Optional id for the section (useful for form navigation)

**Proper implementation:**

```tsx
// Basic form section
<FormSection title="Personal Information">
  <div className="grid grid-cols-2 gap-4">
    <Input label="First Name" />
    <Input label="Last Name" />
  </div>
  <Input label="Email Address" />
</FormSection>

// With description
<FormSection
  title="Contact Details"
  description="How we can reach you regarding your account"
>
  <Input label="Phone Number" />
  <Input label="Alternative Email" />
</FormSection>

// With custom styling and ID
<FormSection
  title="Employment History"
  description="Your recent work experience"
  className="border-t pt-6 mt-6"
  contentClassName="space-y-4"
  id="employment-section"
>
  {/* Form fields */}
</FormSection>

// Multi-section form example
<Form>
  <FormSection title="Account Information">
    {/* Account fields */}
  </FormSection>

  <div className="mt-8">
    <FormSection title="Profile Details">
      {/* Profile fields */}
    </FormSection>
  </div>

  <div className="mt-8">
    <FormSection title="Notification Preferences">
      {/* Notification settings */}
    </FormSection>
  </div>

  <div className="flex justify-end mt-8">
    <Button>Save Changes</Button>
  </div>
</Form>
```

**Do:**

- Group logically related form fields together in a single FormSection
- Use clear, descriptive titles that explain the purpose of the section
- Add descriptions when additional context would help users complete the form
- Maintain consistent spacing between multiple FormSection components
- Use ids for sections in longer forms to support better navigation and accessibility

**Don't:**

- Create too many small form sections that fragment the form experience
- Use overly generic titles that don't clearly describe the section purpose
- Nest FormSection components directly (use dividers or spacing instead)
- Overcrowd a single section with too many form fields

**Spacing Guidelines:**

- FormSection has built-in spacing between the title/description and content (space-y-6)
- Content area also has built-in spacing between elements (space-y-6)
- When using multiple FormSection components, separate them with consistent spacing:

  ```tsx
  <FormSection title="Section 1">
    {/* Content */}
  </FormSection>

  <div className="mt-8">
    <FormSection title="Section 2">
      {/* Content */}
    </FormSection>
  </div>
  ```

**Relationship with other components:**

- Often used within Form components for data collection
- Pairs well with standard form controls (Input, Select, Checkbox, etc.)
- For more complex layout needs, consider combining with ContentSection

### FilterGroup

**Purpose:**

- Organize and display filter controls in a consistent, responsive layout
- Provide a standardized container for filter inputs like selects, inputs, and checkboxes
- Offer mobile-friendly presentation of filters through a collapsible dropdown

**When to use:**

- When displaying multiple filter controls for data tables, grids, or lists
- For allowing users to refine content based on various criteria
- When you need responsive handling of filter controls (desktop vs mobile)
- On pages with data collections that support filtering

**Props:**

- `children`: The filter control elements to display
- `filtersActive`: Boolean indicating if any filters are currently applied
- `onClearFilters`: Optional callback function to reset all filters
- `className`: Optional additional className for the container
- `collapseOnMobile`: Whether to collapse filters into a dropdown on mobile (default: true)
- `mobileLabel`: Label for the mobile dropdown trigger (default: "Filters")

**Proper implementation:**

```tsx
// Basic filter group
<FilterGroup>
  <div className="flex items-center gap-2">
    <Select
      value={statusFilter}
      onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        {/* Options */}
      </SelectContent>
    </Select>
  </div>
</FilterGroup>

// With active filters and clear button
<FilterGroup
  filtersActive={!!statusFilter || !!categoryFilter}
  onClearFilters={handleClearFilters}>
  <div className="flex flex-wrap gap-2">
    <Select
      value={statusFilter}
      onValueChange={setStatusFilter}>
      {/* Status options */}
    </Select>

    <Select
      value={categoryFilter}
      onValueChange={setCategoryFilter}>
      {/* Category options */}
    </Select>
  </div>
</FilterGroup>

// With multiple grouped filters and custom mobile label
<FilterGroup
  filtersActive={filtersActive}
  onClearFilters={handleClearFilters}
  mobileLabel="Filter Results"
  className="mb-6">
  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select value={locationFilter} onValueChange={setLocationFilter}>
        {/* Location options */}
      </Select>
    </div>

    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <Select value={userFilter} onValueChange={setUserFilter}>
        {/* User options */}
      </Select>
    </div>
  </div>
</FilterGroup>
```

**Do:**

- Group related filter controls logically within the FilterGroup
- Use the `filtersActive` prop to indicate when filters are applied
- Provide a `onClearFilters` callback to allow users to reset all filters
- Use icons alongside filter controls to provide visual context
- Maintain consistent spacing between filter controls

**Don't:**

- Overload with too many filter controls (consider separating into multiple groups)
- Mix unrelated filters in the same filter group
- Forget to implement the clear filters functionality when providing the button
- Use inconsistent styling between different filter groups in the application

**Mobile Responsiveness:**

- By default, filters collapse into a dropdown menu on mobile
- Filter actions are preserved in the dropdown view
- Set `collapseOnMobile={false}` only when you have very few filters that fit well on mobile

**Placement Guidelines:**

- Position FilterGroup at the top of content areas, usually immediately below page headers
- For data tables, place FilterGroup above the table
- For grid layouts, place FilterGroup above the grid
- Maintain consistent spacing (typically 24px/1.5rem) between FilterGroup and the content below

### SearchInput

**Purpose:**

- Provide a consistent search input with built-in iconography
- Offer standardized search functionality across the application
- Support clear button functionality for better user experience

**When to use:**

- When allowing users to search or filter content by text
- In combination with other filter controls or independently
- For any searchable content collection or list
- When users need to quickly find specific items within a dataset

**Props:**

- `value`: The current search term (controlled component)
- `onChange`: Callback function when search term changes
- `className`: Optional additional className for the container
- `inputClassName`: Optional additional className for the input element
- `placeholder`: Optional placeholder text (default: "Search...")
- `showClear`: Whether to show the clear button when there is input (default: true)
- `onSearch`: Optional callback function when pressing Enter

**Proper implementation:**

```tsx
// Basic search input
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
/>

// With custom placeholder and width
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search employees..."
  className="w-[300px]"
/>

// With search handling on Enter key
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  onSearch={handleSearch}
  placeholder="Search and press Enter"
/>

// In a filter row with other controls
<div className="flex items-center gap-4 mb-6">
  <SearchInput
    value={searchTerm}
    onChange={setSearchTerm}
    placeholder="Search products..."
    className="w-[250px]"
  />

  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
    {/* Category options */}
  </Select>

  <Button variant="outline" onClick={handleClearFilters}>
    Reset
  </Button>
</div>
```

**Do:**

- Use clear, descriptive placeholder text indicating what users can search for
- Set an appropriate width for the input based on expected search terms
- Implement the `onSearch` handler for immediate search on Enter key press
- Consider debouncing the onChange handler for search-as-you-type functionality
- Pair with FilterGroup when used alongside other filter controls

**Don't:**

- Create custom search inputs with inconsistent styling
- Forget to implement responsive behavior for mobile views
- Place without sufficient surrounding space to maintain visual hierarchy
- Use overly generic placeholder text that doesn't indicate what is being searched

**UI/UX Guidelines:**

- Search icon on the left provides immediate recognition of input purpose
- Clear (X) button appears when text is entered for easy reset
- The input expands to full width on mobile for better usability
- Subtle visual styling maintains hierarchy without dominating the interface

**Placement Guidelines:**

- Position at the top of content areas, typically left-aligned
- In FilterGroup context, usually the leftmost control
- For global search, position consistently in the application header or navigation
- Maintain appropriate spacing from other UI elements (16px/1rem recommended)

### LoadingState

**Purpose:**

- Display consistent loading indicators across the application
- Communicate to users that content is being fetched or processed
- Provide clear visual feedback during asynchronous operations

**When to use:**

- When fetching data from an API or service
- While processing user actions that take time to complete
- In place of content areas before data is available
- As a placeholder during initial page load or data refresh

**Variants:**

- `spinner`: Animated circular spinner (default)
- `dots`: Animated dots sequence for subtle loading indication

**Props:**

- `message`: Optional message to display during loading (default: "Loading...")
- `className`: Optional additional className for the container
- `type`: Type of loading indicator to display (default: "spinner")
- `showMessage`: Whether to show the loading message (default: true)

**Proper implementation:**

```tsx
// Basic spinner with default message
<LoadingState />

// Custom loading message
<LoadingState message="Fetching your data..." />

// Dots style loading without message
<LoadingState type="dots" showMessage={false} />

// Full-page loading state
<div className="flex items-center justify-center min-h-screen">
  <LoadingState message="Initializing application..." />
</div>

// Contextual loading states
{isLoading ? (
  <LoadingState
    message={
      isInitialLoad
        ? "Loading organization information..."
        : "Refreshing employee data..."
    }
  />
) : (
  <DataTable data={employees} columns={columns} />
)}
```

**Do:**

- Use consistent loading indicators throughout the application
- Provide contextual messages that indicate what is being loaded
- Consider using `type="dots"` for less prominent loading states
- Replace entire content areas with loading states rather than showing partial content
- Set appropriate size and padding based on the loading context

**Don't:**

- Mix different loading indicator styles for the same context
- Use overly technical or vague loading messages
- Show loading indicators indefinitely without error handling
- Create custom loading indicators with inconsistent animations
- Overuse loading messages for quick operations (under 500ms)

**Placement Guidelines:**

- Center loading indicators in their containing element
- For full-page loading, center in the viewport
- For content areas, use the same dimensions as the expected content
- Maintain proper spacing around loading indicators (empty space helps visibility)

**Timing Guidelines:**

- Show spinner type for operations likely to take 1+ seconds
- Consider adding estimated time for longer operations (e.g., "This may take a minute...")
- Implement a timeout with friendly error message for operations that take too long
- For very short operations, consider using subtle indicators or transitions instead

## Next Steps

1. Create examples of complex page layouts using all documented components
2. Develop guidelines for component combinations and page patterns
3. Implement a sample refactoring of an existing page to match the standards
4. Create a design system showcase page to demonstrate all components
5. Establish a process for reviewing and approving new components
