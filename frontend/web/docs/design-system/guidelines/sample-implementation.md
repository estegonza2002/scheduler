# Sample Implementation

Below are examples showing how to implement page layouts using our design system guidelines. The examples show both correct implementations using shadcn/ui components with Tailwind CSS.

## Standard Page Layout

```tsx
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";

export function StandardPage() {
	return (
		<>
			<PageHeader
				title="Page Title"
				description="Optional description of the page"
				actions={<Button>Action</Button>}
			/>
			<ContentContainer>
				<ContentSection
					title="Section Title"
					description="Optional section description"
					headerActions={
						<Button
							variant="outline"
							size="sm">
							Section Action
						</Button>
					}>
					{/* Section content */}
					<p>Content follows design system spacing guidelines.</p>
				</ContentSection>

				<ContentSection title="Another Section">
					{/* Another section's content */}
					<p>Another section with proper spacing between sections.</p>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
```

## Common Patterns

### Form Layout

```tsx
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormPage() {
	return (
		<>
			<PageHeader title="Create New Item" />
			<ContentContainer>
				<ContentSection title="Item Details">
					<form className="space-y-6">
						<FormSection title="Basic Information">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										placeholder="Enter name"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Input
										id="description"
										placeholder="Enter description"
									/>
								</div>
							</div>
						</FormSection>

						<FormSection title="Additional Details">
							<div className="space-y-4">{/* Form fields */}</div>
						</FormSection>

						<div className="flex justify-end gap-2">
							<Button variant="outline">Cancel</Button>
							<Button>Save</Button>
						</div>
					</form>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
```

### Page with Tabs

```tsx
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function PageWithTabs() {
	return (
		<>
			<PageHeader title="Page With Tabs" />
			<ContentContainer>
				<Tabs defaultValue="tab1">
					<TabsList>
						<TabsTrigger value="tab1">First Tab</TabsTrigger>
						<TabsTrigger value="tab2">Second Tab</TabsTrigger>
					</TabsList>
					<TabsContent value="tab1">
						<ContentSection title="Tab 1 Content">
							{/* Tab 1 content */}
							<p>
								Content for the first tab following design system guidelines.
							</p>
						</ContentSection>
					</TabsContent>
					<TabsContent value="tab2">
						<ContentSection title="Tab 2 Content">
							{/* Tab 2 content */}
							<p>
								Content for the second tab following design system guidelines.
							</p>
						</ContentSection>
					</TabsContent>
				</Tabs>
			</ContentContainer>
		</>
	);
}
```

### Data Grid Layout

```tsx
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DataGridPage() {
	return (
		<>
			<PageHeader
				title="Data Collection"
				actions={<Button>Add New</Button>}
			/>
			<ContentContainer>
				<ContentSection
					title="Filter and Search"
					flat>
					<div className="flex gap-4 items-center">
						<Input
							placeholder="Search..."
							className="max-w-sm"
						/>
						<Button variant="outline">Filter</Button>
					</div>
				</ContentSection>

				<ContentSection title="Items">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Grid of cards */}
						<Card className="p-4">
							<h3 className="font-medium mb-2">Item 1</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Item 1 description
							</p>
							<Button
								variant="outline"
								size="sm">
								View
							</Button>
						</Card>
						<Card className="p-4">
							<h3 className="font-medium mb-2">Item 2</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Item 2 description
							</p>
							<Button
								variant="outline"
								size="sm">
								View
							</Button>
						</Card>
						<Card className="p-4">
							<h3 className="font-medium mb-2">Item 3</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Item 3 description
							</p>
							<Button
								variant="outline"
								size="sm">
								View
							</Button>
						</Card>
					</div>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
```

## Component Usability Tips

1. Use the `flat` prop on ContentSection when you want content without card styling
2. Group related form fields inside FormSection components
3. Use consistent spacing with Tailwind's space-y-_ and space-x-_ utilities
4. Maintain consistent button hierarchy (one primary button per section)
5. Follow responsive patterns using Tailwind's responsive prefixes
