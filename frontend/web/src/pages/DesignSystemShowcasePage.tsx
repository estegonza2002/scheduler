import React, { useState } from "react";
import {
	AlertTriangle,
	Bell,
	Building,
	Calendar,
	Check,
	ChevronRight,
	Clock,
	Filter,
	Info,
	Plus,
	Search,
	Settings,
	User,
	X,
} from "lucide-react";

// Import all UI components
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCard } from "@/components/ui/alert-card";
import { ItemCard } from "@/components/ui/item-card";
import { FormSection } from "@/components/ui/form-section";
import { FilterGroup } from "@/components/ui/filter-group";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingState } from "@/components/ui/loading-state";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";

export default function DesignSystemShowcasePage() {
	// State for interactive examples
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [showLoading, setShowLoading] = useState(false);

	// Toggle loading state for demonstration
	const toggleLoading = () => {
		setShowLoading(true);
		setTimeout(() => setShowLoading(false), 2000);
	};

	// Function to clear all filters
	const handleClearFilters = () => {
		setStatusFilter("");
		setTypeFilter("");
	};

	return (
		<>
			<PageHeader
				title="Design System Showcase"
				description="Visual reference of all UI components with usage examples"
				actions={
					<Button
						size="sm"
						onClick={() =>
							window.open(
								"/docs/design-system/component-inventory.md",
								"_blank"
							)
						}>
						View Documentation
					</Button>
				}
			/>

			<ContentContainer>
				<Tabs defaultValue="layout">
					<TabsList className="mb-8">
						<TabsTrigger value="layout">Layout Components</TabsTrigger>
						<TabsTrigger value="elements">UI Elements</TabsTrigger>
						<TabsTrigger value="content">Content Patterns</TabsTrigger>
						<TabsTrigger value="forms">Form Components</TabsTrigger>
					</TabsList>

					{/* Layout Components Tab */}
					<TabsContent value="layout">
						<ContentSection
							title="Page Structure Components"
							description="Core components for consistent page layout">
							<Card>
								<CardHeader>
									<CardTitle>PageHeader</CardTitle>
									<CardDescription>
										Used at the top of every page for consistent heading
										structure
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="border rounded-md p-4 bg-muted/30">
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
											<div>
												<h1 className="text-2xl font-bold tracking-tight">
													Page Title
												</h1>
												<p className="text-muted-foreground">
													Optional description text that appears under the title
												</p>
											</div>
											<div>
												<Button size="sm">Primary Action</Button>
											</div>
										</div>
									</div>
									<div className="mt-4 text-sm text-muted-foreground">
										<p>
											Provides consistent spacing, typography, and action
											placement.
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="mt-6">
								<CardHeader>
									<CardTitle>ContentContainer</CardTitle>
									<CardDescription>
										Wrapper for all main content sections on a page
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="border rounded-md p-4 bg-muted/30">
										<div className="p-4 border border-dashed border-muted-foreground/50 rounded-md">
											<p>
												Content container provides consistent padding and
												max-width constraints
											</p>
										</div>
									</div>
									<div className="mt-4 text-sm text-muted-foreground">
										<p>
											Ensures consistent content width and padding across all
											pages.
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="mt-6">
								<CardHeader>
									<CardTitle>ContentSection</CardTitle>
									<CardDescription>
										Container for grouping related content with consistent
										styling
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="border rounded-md p-4 bg-muted/30">
										<div className="mb-4 flex justify-between items-center">
											<div>
												<h3 className="text-lg font-medium">Section Title</h3>
												<p className="text-sm text-muted-foreground">
													Optional section description
												</p>
											</div>
											<Button
												variant="outline"
												size="sm">
												Action
											</Button>
										</div>
										<div className="p-4 border border-dashed border-muted-foreground/50 rounded-md">
											<p>Content goes here</p>
										</div>
									</div>
									<div className="mt-4 text-sm text-muted-foreground">
										<p>
											Use ContentSection to group related content with a
											consistent header style.
										</p>
									</div>
								</CardContent>
							</Card>
						</ContentSection>
					</TabsContent>

					{/* UI Elements Tab */}
					<TabsContent value="elements">
						<ContentSection
							title="Buttons"
							description="Interactive elements for user actions">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Button Variants</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex flex-wrap gap-2">
											<Button>Default</Button>
											<Button variant="secondary">Secondary</Button>
											<Button variant="destructive">Destructive</Button>
											<Button variant="outline">Outline</Button>
											<Button variant="ghost">Ghost</Button>
											<Button variant="link">Link</Button>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Button Sizes</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex flex-wrap items-center gap-2">
											<Button size="sm">Small</Button>
											<Button>Default</Button>
											<Button size="lg">Large</Button>
											<Button size="icon">
												<Plus className="h-4 w-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						</ContentSection>

						<ContentSection
							title="Cards"
							description="Containers for grouping related content"
							className="mt-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Basic Card</CardTitle>
										<CardDescription>
											Standard card with all elements
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p>This is the main content area of the card.</p>
									</CardContent>
									<CardFooter className="flex justify-between">
										<Button variant="outline">Cancel</Button>
										<Button>Save</Button>
									</CardFooter>
								</Card>

								<div className="space-y-4">
									<Card>
										<CardHeader>
											<CardTitle>Simple Card</CardTitle>
										</CardHeader>
										<CardContent>
											<p>Content without footer</p>
										</CardContent>
									</Card>

									<Card>
										<CardContent>
											<p>Card without header or footer</p>
										</CardContent>
									</Card>
								</div>
							</div>
						</ContentSection>

						<ContentSection
							title="Badges"
							description="Status indicators and labels"
							className="mt-8">
							<Card>
								<CardContent className="pt-6">
									<div className="flex flex-wrap gap-2">
										<Badge>Default</Badge>
										<Badge variant="secondary">Secondary</Badge>
										<Badge variant="outline">Outline</Badge>
										<Badge variant="destructive">Destructive</Badge>
									</div>
								</CardContent>
							</Card>
						</ContentSection>
					</TabsContent>

					{/* Content Patterns Tab */}
					<TabsContent value="content">
						<ContentSection
							title="Empty States"
							description="Display when content is not available">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Default Empty State</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<EmptyState
											title="No items found"
											description="Items you create will appear here"
											icon={<Info className="h-6 w-6" />}
											action={
												<Button>
													<Plus className="h-4 w-4 mr-2" />
													Create Item
												</Button>
											}
										/>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Small Empty State</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<EmptyState
											title="No results"
											description="Try adjusting your search terms"
											icon={<Search className="h-5 w-5" />}
											size="small"
										/>
									</CardContent>
								</Card>
							</div>
						</ContentSection>

						<ContentSection
							title="Alert Cards"
							description="Display important notifications to users"
							className="mt-8">
							<div className="grid grid-cols-1 gap-4">
								<AlertCard
									title="Information"
									description="This is an informational message for the user."
								/>

								<AlertCard
									variant="warning"
									title="Warning"
									description="This action cannot be undone. Please proceed with caution."
									icon={<AlertTriangle className="h-5 w-5" />}
								/>

								<AlertCard
									variant="error"
									title="Error"
									description="There was a problem processing your request."
									action={
										<Button
											variant="outline"
											size="sm">
											Try Again
										</Button>
									}
								/>

								<AlertCard
									variant="success"
									title="Success"
									description="Your changes have been saved successfully."
									icon={<Check className="h-5 w-5" />}
									dismissible
									onDismiss={() => console.log("Dismissed")}
								/>
							</div>
						</ContentSection>

						<ContentSection
							title="Item Cards"
							description="Display collection items in a consistent format"
							className="mt-8">
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
								<ItemCard
									title="Basic Item"
									description="Simple item with title and description"
								/>

								<ItemCard
									title="Item with Image"
									description="Item with image and metadata"
									image="https://via.placeholder.com/300x150"
									metadata={
										<div className="text-sm text-muted-foreground">
											Last updated: Today
										</div>
									}
								/>

								<ItemCard
									title="Complete Item"
									description="Item with all features"
									badge={<Badge>Featured</Badge>}
									actions={
										<>
											<Button
												variant="outline"
												size="sm">
												View
											</Button>
											<Button size="sm">Edit</Button>
										</>
									}>
									<div className="mt-2 grid grid-cols-2 gap-2 text-sm">
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											<span>Created today</span>
										</div>
										<div className="flex items-center gap-1">
											<User className="h-3 w-3" />
											<span>Owner: You</span>
										</div>
									</div>
								</ItemCard>
							</div>
						</ContentSection>

						<ContentSection
							title="Loading States"
							description="Display when content is loading"
							className="mt-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Spinner Loading</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										{showLoading ? (
											<LoadingState message="Loading content..." />
										) : (
											<div className="flex justify-center">
												<Button onClick={toggleLoading}>
													Show Loading State
												</Button>
											</div>
										)}
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Dots Loading</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<LoadingState
											type="dots"
											message="Processing your request..."
										/>
									</CardContent>
								</Card>
							</div>
						</ContentSection>
					</TabsContent>

					{/* Form Components Tab */}
					<TabsContent value="forms">
						<ContentSection
							title="Form Inputs"
							description="Basic form controls">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Text Inputs</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name">Name</Label>
											<Input
												id="name"
												placeholder="Enter your name"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												placeholder="Enter your email"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="disabled">Disabled</Label>
											<Input
												id="disabled"
												disabled
												placeholder="Disabled input"
											/>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Select & Checkbox</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="status">Status</Label>
											<Select>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="active">Active</SelectItem>
													<SelectItem value="inactive">Inactive</SelectItem>
													<SelectItem value="pending">Pending</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-4 pt-2">
											<div className="flex items-center space-x-2">
												<Checkbox id="terms" />
												<Label htmlFor="terms">
													Accept terms and conditions
												</Label>
											</div>

											<div className="flex items-center space-x-2">
												<Checkbox
													id="marketing"
													defaultChecked
												/>
												<Label htmlFor="marketing">
													Receive marketing emails
												</Label>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</ContentSection>

						<ContentSection
							title="Form Structure"
							description="Components for organizing forms"
							className="mt-8">
							<Card>
								<CardHeader>
									<CardTitle>Form Section</CardTitle>
									<CardDescription>Group related form fields</CardDescription>
								</CardHeader>
								<CardContent>
									<FormSection
										title="Personal Information"
										description="Your basic contact details">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="first-name">First Name</Label>
												<Input id="first-name" />
											</div>
											<div className="space-y-2">
												<Label htmlFor="last-name">Last Name</Label>
												<Input id="last-name" />
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email-address">Email Address</Label>
											<Input
												id="email-address"
												type="email"
											/>
										</div>
									</FormSection>

									<div className="mt-8">
										<FormSection
											title="Preferences"
											description="Customize your experience">
											<div className="space-y-4">
												<div className="flex items-center space-x-2">
													<Checkbox id="notifications" />
													<Label htmlFor="notifications">
														Enable notifications
													</Label>
												</div>
												<div className="space-y-2">
													<Label htmlFor="theme">Theme</Label>
													<Select>
														<SelectTrigger>
															<SelectValue placeholder="Select theme" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="light">Light</SelectItem>
															<SelectItem value="dark">Dark</SelectItem>
															<SelectItem value="system">System</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										</FormSection>
									</div>
								</CardContent>
								<CardFooter>
									<Button className="ml-auto">Save Changes</Button>
								</CardFooter>
							</Card>
						</ContentSection>

						<ContentSection
							title="Search & Filter"
							description="Components for refining content"
							className="mt-8">
							<div className="grid grid-cols-1 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Search Input</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="max-w-md">
											<SearchInput
												value={searchTerm}
												onChange={setSearchTerm}
												placeholder="Search items..."
											/>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Filter Group</CardTitle>
									</CardHeader>
									<CardContent>
										<FilterGroup
											filtersActive={!!statusFilter || !!typeFilter}
											onClearFilters={handleClearFilters}>
											<div className="flex flex-col sm:flex-row gap-2 sm:items-center">
												<div className="flex items-center gap-2">
													<Settings className="h-4 w-4 text-muted-foreground" />
													<Select
														value={statusFilter}
														onValueChange={setStatusFilter}>
														<SelectTrigger className="w-[180px]">
															<SelectValue placeholder="Filter by status" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="active">Active</SelectItem>
															<SelectItem value="inactive">Inactive</SelectItem>
															<SelectItem value="archived">Archived</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<div className="flex items-center gap-2">
													<Filter className="h-4 w-4 text-muted-foreground" />
													<Select
														value={typeFilter}
														onValueChange={setTypeFilter}>
														<SelectTrigger className="w-[180px]">
															<SelectValue placeholder="Filter by type" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="document">Document</SelectItem>
															<SelectItem value="image">Image</SelectItem>
															<SelectItem value="video">Video</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										</FilterGroup>

										{/* Example filtered content */}
										<div className="mt-6 border rounded-md p-4">
											{statusFilter || typeFilter ? (
												<div>
													<p>Showing filtered content:</p>
													<ul className="mt-2 space-y-1 text-sm">
														{statusFilter && <li>Status: {statusFilter}</li>}
														{typeFilter && <li>Type: {typeFilter}</li>}
													</ul>
												</div>
											) : (
												<p>Select filters to see filtered content</p>
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						</ContentSection>
					</TabsContent>
				</Tabs>

				<ContentSection
					title="Next Steps"
					description="Continuing design system development"
					className="mt-8">
					<Card>
						<CardContent className="pt-6">
							<ul className="space-y-2">
								<li className="flex items-start">
									<ChevronRight className="h-5 w-5 mr-2 mt-0.5" />
									<div>
										<p className="font-medium">
											Develop component combinations and patterns
										</p>
										<p className="text-sm text-muted-foreground">
											Create guidelines for how components work together in
											common layouts
										</p>
									</div>
								</li>
								<li className="flex items-start">
									<ChevronRight className="h-5 w-5 mr-2 mt-0.5" />
									<div>
										<p className="font-medium">Refactor existing pages</p>
										<p className="text-sm text-muted-foreground">
											Apply design system standards to all application pages
										</p>
									</div>
								</li>
								<li className="flex items-start">
									<ChevronRight className="h-5 w-5 mr-2 mt-0.5" />
									<div>
										<p className="font-medium">
											Establish component review process
										</p>
										<p className="text-sm text-muted-foreground">
											Create workflow for approving and documenting new
											components
										</p>
									</div>
								</li>
							</ul>
						</CardContent>
					</Card>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
