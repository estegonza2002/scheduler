import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Employee, EmployeesAPI } from "@/api";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/ui/form-section";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	DollarSign,
	BadgeAlert,
	StickyNote,
	Loader2,
} from "lucide-react";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";

// Define available positions
const POSITIONS = ["Supervisor", "Runner"] as const;

// Input values - these are the form field values before transformation
interface EmployeeFormInput {
	name: string;
	email: string;
	phone?: string;
	address?: string;
	position?: string;
	hourlyRate?: string; // String for input
	hireDate?: string;
	emergencyContact?: string;
	notes?: string;
}

// Define the form schema for validation
const employeeFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	phone: z
		.string()
		.optional()
		.refine(
			(val) => !val || isValidPhoneNumber(val),
			"Please enter a valid phone number"
		),
	address: z.string().optional(),
	position: z.string().optional(),
	hourlyRate: z.string().optional(),
	hireDate: z.string().optional(),
	emergencyContact: z.string().optional(),
	notes: z.string().optional(),
});

interface EmployeeFormProps {
	organizationId: string;
	initialData?: Employee;
	onSuccess?: (employee: Employee) => void;
	/**
	 * Optional callback to expose form state and submit function to parent component
	 */
	onFormReady?: (formState: {
		isDirty: boolean;
		isValid: boolean;
		isSubmitting: boolean;
		isEditing: boolean;
		submit: () => void;
	}) => void;
}

export function EmployeeForm({
	organizationId,
	initialData,
	onSuccess,
	onFormReady,
}: EmployeeFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = !!initialData;

	// Initialize form with default values or existing data
	const form = useForm<EmployeeFormInput>({
		resolver: zodResolver(employeeFormSchema),
		defaultValues: {
			name: initialData?.name || "",
			email: initialData?.email || "",
			phone: initialData?.phone || "",
			address: initialData?.address || "",
			position: initialData?.role || "", // Map role to position
			hourlyRate:
				initialData?.hourlyRate !== undefined
					? initialData.hourlyRate.toString()
					: "",
			hireDate: initialData?.hireDate || "",
			emergencyContact: initialData?.emergencyContact || "",
			notes: initialData?.notes || "",
		},
	});

	// Handle form submission
	const onSubmit = async (data: EmployeeFormInput) => {
		try {
			setIsSubmitting(true);

			// Parse hourlyRate to number if present
			let hourlyRate: number | undefined = undefined;
			if (data.hourlyRate && data.hourlyRate.trim() !== "") {
				const parsed = parseFloat(data.hourlyRate);
				if (!isNaN(parsed)) {
					hourlyRate = parsed;
				}
			}

			// Create a properly structured employee object
			const employeeData: Omit<Employee, "id"> = {
				organizationId,
				name: data.name,
				email: data.email,
				role: data.position || "Employee",
				phone: data.phone || undefined,
				hireDate: data.hireDate || undefined,
				address: data.address || undefined,
				emergencyContact: data.emergencyContact || undefined,
				notes: data.notes || undefined,
				hourlyRate,
				status: initialData?.status || "active",
				isOnline: initialData?.isOnline || false,
				lastActive: initialData?.lastActive || new Date().toISOString(),
			};

			console.log("Submitting employee data:", employeeData);

			if (isEditing && initialData) {
				const result = await EmployeesAPI.update(initialData.id, employeeData);
				toast.success("Employee updated successfully");
				if (onSuccess && result) {
					onSuccess(result);
				}
			} else {
				const result = await EmployeesAPI.create(employeeData);
				toast.success("Employee added successfully");
				if (onSuccess && result) {
					onSuccess(result);
				}
			}

			// Reset form if not editing
			if (!isEditing) {
				form.reset();
			}
		} catch (error) {
			console.error("Error saving employee:", error);
			toast.error(
				isEditing ? "Failed to update employee" : "Failed to add employee"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Wrap form submission to be callable from outside
	const handleSubmit = useCallback(() => {
		return () => {
			form.handleSubmit(onSubmit)();
		};
	}, [form, onSubmit]);

	// Expose form state and submit function to parent component with optimization
	useEffect(() => {
		if (!onFormReady) return;

		// Only update when necessary values change
		const isDirty = form.formState.isDirty;

		// Get current form values
		const formValues = form.getValues();

		// Check if the form is valid by seeing if there are any errors
		const isValid =
			Object.keys(form.formState.errors).length === 0 &&
			!!formValues.name &&
			!!formValues.email;

		// Debug log to see form state
		console.log("Form state:", {
			isDirty,
			isValid,
			errors: form.formState.errors,
			name: formValues.name,
			email: formValues.email,
		});

		onFormReady({
			isDirty,
			isValid,
			isSubmitting,
			isEditing,
			submit: handleSubmit(),
		});
	}, [
		form.formState.isDirty,
		form.formState.errors,
		isSubmitting,
		isEditing,
		onFormReady,
		handleSubmit,
	]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6">
				<FormSection
					title="Basic Information"
					description="Enter the employee's name and primary contact details">
					<div className="grid grid-cols-1 gap-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Full Name <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<div className="flex items-center">
											<User className="w-4 h-4 mr-2 text-muted-foreground" />
											<Input
												placeholder="John Doe"
												{...field}
												aria-required="true"
												aria-invalid={!!form.formState.errors.name}
												required
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Email <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<div className="flex items-center">
											<Mail className="w-4 h-4 mr-2 text-muted-foreground" />
											<Input
												placeholder="john@example.com"
												type="email"
												{...field}
												aria-required="true"
												aria-invalid={!!form.formState.errors.email}
												required
											/>
										</div>
									</FormControl>
									<FormDescription className="text-xs">
										The employee will use this email to log in and receive
										notifications.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				<FormSection
					title="Contact Information"
					description="Add contact details for communication and record-keeping">
					<div className="grid grid-cols-1 gap-4">
						<FormPhoneInput
							control={form.control}
							name="phone"
							label="Phone Number"
							placeholder="Enter international phone number"
						/>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<div className="flex items-center">
											<MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
											<Input
												placeholder="123 Main St, Anytown, ST"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				<FormSection
					title="Employment Details"
					description="Provide information about the employee's role and employment terms">
					<div className="grid grid-cols-1 gap-4">
						<FormField
							control={form.control}
							name="position"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Position</FormLabel>
									<FormControl>
										<div className="flex items-center">
											<BadgeAlert className="w-4 h-4 mr-2 text-muted-foreground" />
											<Select
												onValueChange={field.onChange}
												value={field.value || ""}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select a position" />
												</SelectTrigger>
												<SelectContent>
													{POSITIONS.map((position) => (
														<SelectItem
															key={position}
															value={position}>
															{position}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="hourlyRate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Hourly Rate ($)</FormLabel>
									<FormControl>
										<div className="flex items-center">
											<DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
											<Input
												type="number"
												step="0.01"
												min="0"
												placeholder="15.50"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="hireDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Hire Date</FormLabel>
									<FormControl>
										<div className="flex items-center">
											<Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
											<Input
												type="date"
												{...field}
												value={field.value || ""}
												onChange={(e) => {
													// Ensure valid date format
													if (e.target.value === "") {
														field.onChange("");
													} else {
														try {
															// Validate that it's a proper date
															const date = new Date(e.target.value);
															if (!isNaN(date.getTime())) {
																// Format as YYYY-MM-DD for database compatibility
																const formattedDate = date
																	.toISOString()
																	.split("T")[0];
																field.onChange(formattedDate);
															} else {
																field.onChange("");
															}
														} catch (error) {
															field.onChange("");
														}
													}
												}}
											/>
										</div>
									</FormControl>
									<FormDescription className="text-xs">
										Leave blank if not applicable.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				<FormSection
					title="Additional Information"
					description="Include emergency contact details and other relevant notes">
					<FormField
						control={form.control}
						name="emergencyContact"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Emergency Contact</FormLabel>
								<FormDescription>
									Name, relationship, and phone number of emergency contact
								</FormDescription>
								<FormControl>
									<div className="flex items-center">
										<Phone className="w-4 h-4 mr-2 text-muted-foreground" />
										<Input
											placeholder="Jane Doe (Spouse) - 555-789-1234"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<FormItem className="mt-4">
								<FormLabel>Notes</FormLabel>
								<FormDescription>
									Any additional information about this employee
								</FormDescription>
								<FormControl>
									<div className="flex items-start">
										<StickyNote className="w-4 h-4 mr-2 mt-2 text-muted-foreground" />
										<Textarea
											placeholder="Additional information about this employee..."
											className="h-24"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</FormSection>
			</form>
		</Form>
	);
}
