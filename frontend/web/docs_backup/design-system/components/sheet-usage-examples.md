# ShadCN Sheet Usage Examples

This document provides examples of how to implement different types of sheets using standard ShadCN components and Tailwind CSS, without any custom wrapper components.

## Form Sheet Example

```tsx
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

// Form validation schema
const formSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LocationFormSheetExample({ initialData, onSave }) {
	const [open, setOpen] = useState(false);

	// Initialize form with React Hook Form
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: initialData || {
			name: "",
			address: "",
			city: "",
			state: "",
			zipCode: "",
		},
	});

	const onSubmit = async (values: FormValues) => {
		try {
			await onSave(values);
			setOpen(false);
		} catch (error) {
			console.error("Error saving location:", error);
		}
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>{initialData ? "Edit Location" : "Add Location"}</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<div className="flex items-center gap-2">
						<Building className="h-5 w-5 text-primary" />
						<SheetTitle>
							{initialData ? "Edit Location" : "New Location"}
						</SheetTitle>
					</div>
					<SheetDescription>
						{initialData
							? "Update location details here. Click save when you're done."
							: "Add a new location to your organization."}
					</SheetDescription>
				</SheetHeader>

				<ScrollArea className="my-4 h-[calc(100vh-12rem)]">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4 py-4 px-1">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Location name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Input
												placeholder="Street address"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City</FormLabel>
											<FormControl>
												<Input
													placeholder="City"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>State</FormLabel>
											<FormControl>
												<Input
													placeholder="State"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="zipCode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Zip Code</FormLabel>
										<FormControl>
											<Input
												placeholder="Zip code"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</ScrollArea>

				<SheetFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
						className="mr-auto">
						Cancel
					</Button>
					<Button
						type="submit"
						onClick={form.handleSubmit(onSubmit)}>
						Save
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
```

## Confirmation Sheet Example

```tsx
import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function ConfirmationSheetExample({ itemName, onConfirm }) {
	const [open, setOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	const handleConfirm = async () => {
		try {
			setIsProcessing(true);
			await onConfirm();
		} catch (error) {
			console.error("Action failed:", error);
		} finally {
			setIsProcessing(false);
			setOpen(false);
		}
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="destructive"
					size="sm">
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-sm">
				<SheetHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						<SheetTitle>Confirm Delete</SheetTitle>
					</div>
					<SheetDescription>
						Are you sure you want to delete {itemName}?
					</SheetDescription>
				</SheetHeader>

				<div className="my-4 p-4 bg-destructive/10 rounded-md border border-destructive/30">
					<p className="text-sm text-muted-foreground">
						This action cannot be undone. This will permanently delete this item
						and remove all associated data.
					</p>
				</div>

				<SheetFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isProcessing}
						className="mr-auto">
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						disabled={isProcessing}>
						{isProcessing ? "Deleting..." : "Delete"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
```

## Information Sheet Example

```tsx
import { useState } from "react";
import { Info, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function InformationSheetExample({ employee }) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline">View Details</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-lg">
				<SheetHeader>
					<div className="flex items-center gap-2">
						<Info className="h-5 w-5 text-primary" />
						<SheetTitle>Employee Details</SheetTitle>
					</div>
					<SheetDescription>Information about {employee.name}</SheetDescription>
				</SheetHeader>

				<ScrollArea className="my-4 h-[calc(100vh-10rem)]">
					<div className="space-y-6">
						<div className="flex items-center space-x-4">
							<Avatar className="h-16 w-16">
								<AvatarImage
									src={employee.avatar}
									alt={employee.name}
								/>
								<AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="text-lg font-medium">{employee.name}</h3>
								<p className="text-sm text-muted-foreground">
									{employee.position}
								</p>
								{employee.status && (
									<Badge
										variant={
											employee.status === "Active" ? "outline" : "secondary"
										}
										className="mt-1">
										{employee.status}
									</Badge>
								)}
							</div>
						</div>

						<div className="space-y-3">
							<h4 className="text-sm font-medium">Contact Information</h4>
							<div className="grid gap-2">
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">{employee.email}</span>
								</div>
								{employee.phone && (
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm">{employee.phone}</span>
									</div>
								)}
								{employee.address && (
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
										<span className="text-sm">{employee.address}</span>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-3">
							<h4 className="text-sm font-medium">Employment Information</h4>
							<div className="grid gap-2">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Joined: {employee.joinDate}</span>
								</div>
								{/* Add more employee details as needed */}
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
```

## Multi-step Sheet Example

```tsx
import { useState } from "react";
import { Calendar, ArrowRight, Check } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

// Step content components would be defined here

export function MultiStepSheetExample() {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		date: null,
		location: null,
		employee: null,
	});

	const totalSteps = 3;

	const handleNext = () => {
		if (step < totalSteps) {
			setStep(step + 1);
		} else {
			// Handle final submission
			handleSubmit();
		}
	};

	const handleBack = () => {
		if (step > 1) {
			setStep(step - 1);
		}
	};

	const handleSubmit = async () => {
		try {
			// Submit form data
			console.log("Submitting:", formData);
			// Reset and close
			setStep(1);
			setOpen(false);
		} catch (error) {
			console.error("Error submitting:", error);
		}
	};

	// Helper function to render the correct step content
	const renderStepContent = () => {
		switch (step) {
			case 1:
				return (
					<div className="space-y-4">
						<h3 className="text-sm font-medium">Select Date</h3>
						{/* Date selection UI */}
						<Card>
							<CardContent className="p-4">
								Date picker would go here
							</CardContent>
						</Card>
					</div>
				);
			case 2:
				return (
					<div className="space-y-4">
						<h3 className="text-sm font-medium">Select Location</h3>
						{/* Location selection UI */}
						<Card>
							<CardContent className="p-4">
								Location selection would go here
							</CardContent>
						</Card>
					</div>
				);
			case 3:
				return (
					<div className="space-y-4">
						<h3 className="text-sm font-medium">Select Employee</h3>
						{/* Employee selection UI */}
						<Card>
							<CardContent className="p-4">
								Employee selection would go here
							</CardContent>
						</Card>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>
					<Calendar className="mr-2 h-4 w-4" />
					Create Shift
				</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-lg">
				<SheetHeader>
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						<SheetTitle>Create New Shift</SheetTitle>
					</div>
					<SheetDescription>
						Complete each step to create a new shift.
					</SheetDescription>

					{/* Progress indicator */}
					<div className="w-full mt-2">
						<div className="flex justify-between">
							{Array.from({ length: totalSteps }).map((_, index) => (
								<div
									key={index}
									className={`flex items-center justify-center w-8 h-8 rounded-full 
                    ${
											index + 1 === step
												? "bg-primary text-primary-foreground"
												: index + 1 < step
												? "bg-primary/20 text-primary"
												: "bg-muted text-muted-foreground"
										}`}>
									{index + 1 < step ? (
										<Check className="h-4 w-4" />
									) : (
										<span>{index + 1}</span>
									)}
								</div>
							))}
						</div>
						<div className="relative mt-1">
							<div className="absolute top-0 left-0 h-1 bg-muted w-full"></div>
							<div
								className="absolute top-0 left-0 h-1 bg-primary transition-all"
								style={{
									width: `${((step - 1) / (totalSteps - 1)) * 100}%`,
								}}></div>
						</div>
					</div>
				</SheetHeader>

				<ScrollArea className="my-4 h-[calc(100vh-16rem)]">
					{renderStepContent()}
				</ScrollArea>

				<SheetFooter>
					{step > 1 && (
						<Button
							type="button"
							variant="outline"
							onClick={handleBack}
							className="mr-auto">
							Back
						</Button>
					)}
					<Button
						type="button"
						onClick={handleNext}>
						{step === totalSteps ? (
							"Create Shift"
						) : (
							<>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
```
