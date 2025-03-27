# Sample Implementation

Below is a standardized implementation example that follows our design system guidelines using shadcn/ui components with Tailwind CSS:

```tsx
// src/pages/SampleStandardPage.tsx
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "../components/ui/card";

export function SampleStandardPage() {
	return (
		<>
			{/* Page header using direct Tailwind classes instead of custom PageHeader component */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">Sample Page</h1>
					<p className="text-muted-foreground mt-1">
						A standardized page following design system guidelines
					</p>
				</div>
				<Button size="sm">Primary Action</Button>
			</div>

			{/* Content container using Tailwind spacing instead of custom ContentContainer */}
			<div className="space-y-6">
				{/* Content section using direct shadcn/ui Card instead of custom ContentSection */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Main Content</CardTitle>
								<CardDescription>
									This section demonstrates proper content structuring
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm">
								Section Action
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{/* Section content goes here */}
						<p>
							Content follows Tailwind spacing guidelines and uses shadcn/ui
							components directly without custom wrappers.
						</p>
					</CardContent>
				</Card>

				{/* Flat section using direct Tailwind classes instead of ContentSection with flat=true */}
				<div className="mt-6">
					<h2 className="text-xl font-semibold mb-3">Secondary Content</h2>
					<p>
						This section uses simple Tailwind classes without extra wrappers for
						cleaner code.
					</p>
				</div>
			</div>
		</>
	);
}
```

## Before/After Comparison

### Before (with custom wrapper components)

```tsx
// BEFORE: Using custom wrapper components
import { Button } from "../components/ui/button";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { HeaderContentSpacing } from "../components/ui/header-content-spacing";
import { PageHeader } from "../components/ui/page-header";

export function BeforeSamplePage() {
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

### After (with direct shadcn/ui components and Tailwind)

```tsx
// AFTER: Using direct shadcn/ui with Tailwind
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "../components/ui/card";

export function AfterSamplePage() {
	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">Sample Page</h1>
					<p className="text-muted-foreground mt-1">
						A standardized page following design system guidelines
					</p>
				</div>
				<Button size="sm">Primary Action</Button>
			</div>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Main Content</CardTitle>
								<CardDescription>
									This section demonstrates proper content structuring
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm">
								Section Action
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{/* Section content goes here */}
						<p>
							Content follows Tailwind spacing guidelines and uses shadcn/ui
							components directly without custom wrappers.
						</p>
					</CardContent>
				</Card>

				<div className="mt-6">
					<h2 className="text-xl font-semibold mb-3">Secondary Content</h2>
					<p>
						This section uses simple Tailwind classes without extra wrappers for
						cleaner code.
					</p>
				</div>
			</div>
		</>
	);
}
```

The "after" implementation provides several benefits:

- Reduced component dependencies
- Cleaner import statements
- More direct control over styling with Tailwind
- Simplified component hierarchy
- Easier to understand for new developers
