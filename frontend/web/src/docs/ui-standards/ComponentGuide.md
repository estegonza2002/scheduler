# UI Component Guide

This guide documents our reusable UI components and their proper usage to maintain consistency across the application.

## Layout Components

### PageHeader

Use for consistent page headers across the application.

```tsx
import { PageHeader } from "@/components/ui/page-header";

<PageHeader
	title="Page Title"
	description="Description of the page content"
	actions={<Button>Action</Button>}
/>;
```

### ContentContainer

Use to wrap main content with consistent padding and max-width.

```tsx
import { ContentContainer } from "@/components/ui/content-container";

<ContentContainer>{/* Page content */}</ContentContainer>;
```

### ContentSection

Use for dividing content into logical sections.

```tsx
import { ContentSection } from "@/components/ui/content-section";

<ContentSection
	title="Section Title"
	description="Optional description of this section">
	{/* Section content */}
</ContentSection>;
```

## Data Display Components

### DataTable

Use for displaying tabular data with sorting, filtering, and pagination.

```tsx
import { DataTable } from "@/components/ui/data-table";

<DataTable
	columns={columns}
	data={data}
	searchable={true}
	searchField="name"
/>;
```

### ItemCard

Use for displaying items in a card-based grid layout.

```tsx
import { ItemCard } from "@/components/ui/item-card";

<ItemCard
	title="Item Title"
	description="Item description"
	image="/path/to/image.jpg"
	actions={
		<Button
			size="sm"
			variant="outline">
			View
		</Button>
	}
/>;
```

### EmptyState

Use for displaying meaningful empty states when data is not available.

```tsx
import { EmptyState } from "@/components/ui/empty-state";

<EmptyState
	title="No items found"
	description="Try adjusting your filters or search terms."
	icon={<SearchIcon />}
	action={<Button>Create New</Button>}
/>;
```

### LoadingState

Use for displaying loading indicators consistently.

```tsx
import { LoadingState } from "@/components/ui/loading-state";

<LoadingState message="Loading items..." />;
```

## Form Components

### FormSection

Use to group related form fields.

```tsx
import { FormSection } from "@/components/ui/form-section";

<FormSection
	title="Personal Information"
	description="Enter your personal details">
	{/* Form fields */}
</FormSection>;
```

### SearchInput

Use for consistent search functionality.

```tsx
import { SearchInput } from "@/components/ui/search-input";

<SearchInput
	placeholder="Search employees..."
	value={searchTerm}
	onChange={setSearchTerm}
/>;
```

### FilterGroup

Use for organizing filter controls.

```tsx
import { FilterGroup } from "@/components/ui/filter-group";

<FilterGroup>
	<Select
		value={statusFilter}
		onValueChange={setStatusFilter}
		placeholder="Filter by status">
		{/* Options */}
	</Select>

	<DateRangePicker
		onChange={setDateRange}
		value={dateRange}
	/>
</FilterGroup>;
```

## Feedback Components

### AlertCard

Use for displaying messages that need attention.

```tsx
import { AlertCard } from "@/components/ui/alert-card";

<AlertCard
	title="Action Required"
	description="Complete your profile information."
	variant="warning"
	action={<Button size="sm">Update Profile</Button>}
/>;
```

### StatusBadge

Use for displaying status information consistently.

```tsx
import { StatusBadge } from "@/components/ui/status-badge";

<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="inactive" />
```

### ConfirmDialog

Use for confirming destructive actions.

```tsx
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

<ConfirmDialog
	title="Delete Item"
	description="Are you sure you want to delete this item? This action cannot be undone."
	confirmLabel="Delete"
	onConfirm={handleDelete}
	trigger={<Button variant="destructive">Delete</Button>}
/>;
```

## Navigation Components

### Breadcrumbs

Use for consistent breadcrumb navigation.

```tsx
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

<Breadcrumbs
	items={[
		{ label: "Home", href: "/" },
		{ label: "Employees", href: "/employees" },
		{ label: "John Doe", href: "/employees/123", current: true },
	]}
/>;
```

### Tabs

Use for organizing content into tabs.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="overview">
	<TabsList>
		<TabsTrigger value="overview">Overview</TabsTrigger>
		<TabsTrigger value="details">Details</TabsTrigger>
	</TabsList>
	<TabsContent value="overview">{/* Overview content */}</TabsContent>
	<TabsContent value="details">{/* Details content */}</TabsContent>
</Tabs>;
```

## Component Composition Guidelines

### Page Layout Composition

Standard page composition pattern:

```tsx
<PageHeader
  title="Employees"
  description="View and manage employee information"
  actions={<Button>Add Employee</Button>}
/>

<ContentContainer>
  <div className="mb-6">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>View all employees in your organization</CardDescription>
          </div>
          <div className="flex gap-2">
            <SearchInput />
            <FilterGroup />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable />
      </CardContent>
    </Card>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  </div>
</ContentContainer>
```

### Detail Page Composition

Standard detail page composition:

```tsx
<PageHeader
  title="Employee Details"
  description="View and edit employee information"
  actions={
    <>
      <Button variant="outline">Delete</Button>
      <Button>Edit</Button>
    </>
  }
/>

<ContentContainer>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Employee details */}
        </CardContent>
      </Card>
    </div>

    <div>
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Contact details */}
        </CardContent>
      </Card>
    </div>
  </div>
</ContentContainer>
```
