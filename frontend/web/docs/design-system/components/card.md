# Card Component

Cards are used to group related information and actions. They provide a flexible container for displaying content and actions in a variety of contexts.

## Basic Usage

```jsx
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";

<Card>
	<CardHeader>
		<CardTitle>Card Title</CardTitle>
		<CardDescription>Optional card description</CardDescription>
	</CardHeader>
	<CardContent>
		<p>Card content goes here</p>
	</CardContent>
	<CardFooter>
		<Button>Action</Button>
	</CardFooter>
</Card>;
```

## Component Structure

Cards should follow a predictable structure:

1. `Card` - The main container
2. `CardHeader` - Contains title and optional description
3. `CardContent` - Main content area
4. `CardFooter` - Optional area for actions

## Best Practices

- Always use Card components for card-like UI elements
- Include at least one sub-component (CardHeader or CardContent)
- Don't use custom div elements with card-like styling
- Don't add custom border or shadow styles directly to Card

## Examples

### Basic Card

```jsx
<Card>
	<CardHeader>
		<CardTitle>Account</CardTitle>
		<CardDescription>Manage your account settings</CardDescription>
	</CardHeader>
	<CardContent>
		<p>Your account information is displayed here</p>
	</CardContent>
	<CardFooter>
		<Button>Save Changes</Button>
	</CardFooter>
</Card>
```

### Simple Card

```jsx
<Card>
	<CardContent>
		<p>Card with just content</p>
	</CardContent>
</Card>
```

### Interactive Card

```jsx
<Card
	className="cursor-pointer hover:border-primary transition-colors"
	onClick={() => navigate("/details")}>
	<CardHeader>
		<CardTitle>View Details</CardTitle>
	</CardHeader>
	<CardContent>
		<p>Click to see more information</p>
	</CardContent>
</Card>
```

### Card with Table

```jsx
<Card>
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>Name</TableHead>
				<TableHead>Status</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			<TableRow>
				<TableCell>John Doe</TableCell>
				<TableCell>Active</TableCell>
			</TableRow>
		</TableBody>
	</Table>
</Card>
```

## Customization

For custom styling, use the `className` prop and avoid modifying the core Card components:

```jsx
<Card className="border-primary">
	<CardContent>Custom styled card</CardContent>
</Card>
```

## Accessibility

Cards are not focusable by default. If a card is interactive (e.g., clickable), ensure it:

1. Has keyboard focus (via tabIndex={0})
2. Includes appropriate ARIA attributes
3. Has proper hover and focus states

```jsx
<Card
	className="cursor-pointer hover:border-primary focus:border-primary focus:outline-none transition-colors"
	onClick={handleClick}
	tabIndex={0}
	role="button"
	aria-label="View details">
	<CardContent>Interactive card content</CardContent>
</Card>
```
