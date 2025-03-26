# Layout Standardization Guide

This document outlines how to standardize layouts across all pages in our application using Shadcn UI components.

## Standard Page Layout Pattern

For authenticated pages, we use a consistent layout pattern:

### For Regular Pages:

```jsx
<>
	<PageHeader
		title="Page Title"
		description="Page description"
		showBackButton={boolean} // Optional
	/>
	<PageContentSpacing>
		<ContentContainer>{/* Page content goes here */}</ContentContainer>
	</PageContentSpacing>
</>
```

### For Pages with Sidebar:

```jsx
<>
	<PageHeader
		title="Page Title"
		description="Page description"
		showBackButton={boolean} // Optional
	/>
	<div className="flex">
		<ProfileSidebar
			activeTab="tabname"
			onTabChange={handleTabChange}
		/>
		<PageContentSpacing>
			<ContentContainer>{/* Page content goes here */}</ContentContainer>
		</PageContentSpacing>
	</div>
</>
```

## Required Imports

For each page, import these components:

```jsx
import { PageHeader } from "../components/ui/page-header";
import { PageContentSpacing } from "../components/ui/header-content-spacing";
import { ContentContainer } from "../components/ui/content-container";
```

For sidebar pages, also import:

```jsx
import { ProfileSidebar } from "../components/layout/SecondaryNavbar";
```

## Pages Already Updated

The following pages have been updated to use the standardized layout:

1. ✅ ShiftDetailsPage
2. ✅ BillingPage
3. ✅ BrandingPage
4. ✅ BusinessProfilePage
5. ✅ DailyShiftsPage
6. ✅ EditShiftPage
7. ✅ EmployeeDetailPage
8. ✅ EmployeeEarningsPage
9. ✅ EmployeesPage (has linter errors that need to be fixed)

## Auth Pages (Different Layout)

The following pages have a different layout for authentication and should NOT be updated:

1. LoginPage
2. RegisterPage
3. ForgotPasswordPage
4. ResetPasswordPage
5. VerifyEmailPage

## Pages That Need Updates

The following pages still need to be updated to use the standardized layout:

1. IntegrationsPage
2. LocationDetailPage
3. LocationsPage
4. NotificationsPage
5. PrivacyPolicyPage
6. RolesPage
7. SchedulePage
8. SettingsPage
9. TermsOfServicePage
10. UserProfilePage

## How to Update a Page

1. Add the required imports at the top of the file.
2. Wrap the content with the standard layout pattern.
3. Maintain existing functionality within the standardized structure.
4. If the page uses a sidebar, ensure the sidebar component is properly integrated.

### Example Transformation:

Before:

```jsx
<>
	<PageHeader
		title="Page Title"
		description="Page description"
	/>
	<div className="p-4">{/* Page content */}</div>
</>
```

After:

```jsx
<>
	<PageHeader
		title="Page Title"
		description="Page description"
	/>
	<PageContentSpacing>
		<ContentContainer>{/* Page content */}</ContentContainer>
	</PageContentSpacing>
</>
```

## Testing

After updating each page:

1. Verify the page appears correctly with proper spacing and layout.
2. Ensure all functionality continues to work as expected.
3. Check for any console errors or warnings.
4. Verify responsive behavior on different screen sizes.
