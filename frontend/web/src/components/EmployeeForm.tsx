import { useState } from "react";
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
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
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
} from "lucide-react";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";

// Define available positions
const POSITIONS = ["Supervisor", "Runner"] as const;

const employeeFormSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be less than 100 characters")
		.refine((val) => /^[a-zA-Z\s\-'.]+$/.test(val), {
			message:
				"Name should only contain letters, spaces, hyphens, apostrophes and periods",
		}),
	email: z
		.string()
		.email("Please enter a valid email address")
		.min(5, "Email address is too short")
		.max(100, "Email address is too long"),
	phone: z
		.string()
		.optional()
		.refine(
			(val) => !val || isValidPhoneNumber(val),
			"Please enter a valid phone number"
		),
	position: z.union([z.enum(POSITIONS), z.literal("")]).optional(),
	hireDate: z
		.string()
		.optional()
		.refine(
			(val) => {
				if (!val) return true;
				const date = new Date(val);
				const now = new Date();
				// Allow dates up to 5 years in the past or 1 year in the future
				return (
					date >= new Date(now.setFullYear(now.getFullYear() - 5)) &&
					date <= new Date(new Date().setFullYear(new Date().getFullYear() + 1))
				);
			},
			{
				message:
					"Hire date must be within the last 5 years or up to 1 year in the future",
			}
		),
	address: z.string().max(200, "Address is too long").optional(),
	emergencyContact: z
		.string()
		.max(200, "Emergency contact information is too long")
		.optional(),
	notes: z
		.string()
		.max(1000, "Notes must be less than 1000 characters")
		.optional(),
	hourlyRate: z
		.string()
		.optional()
		.refine(
			(val) => {
				if (!val) return true;
				const rate = parseFloat(val);
				return !isNaN(rate) && rate >= 0 && rate <= 1000;
			},
			{
				message: "Hourly rate must be between $0 and $1000",
			}
		),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
	organizationId: string;
	initialData?: Employee;
	onSuccess?: (employee: Employee) => void;
}

export function EmployeeForm({
	organizationId,
	initialData,
	onSuccess,
}: EmployeeFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = !!initialData;

	const form = useForm<EmployeeFormValues>({
		resolver: zodResolver(employeeFormSchema),
		defaultValues: {
			name: initialData?.name || "",
			email: initialData?.email || "",
			phone: initialData?.phone || "",
			position:
				initialData?.position && POSITIONS.includes(initialData.position as any)
					? (initialData.position as any)
					: undefined,
			hireDate: initialData?.hireDate || "",
			address: initialData?.address || "",
			emergencyContact: initialData?.emergencyContact || "",
			notes: initialData?.notes || "",
			hourlyRate: initialData?.hourlyRate
				? initialData.hourlyRate.toString()
				: "",
		},
	});

	const onSubmit = async (data: EmployeeFormValues) => {
		try {
			setIsSubmitting(true);

			const formattedData = {
				...data,
				hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : undefined,
				position: data.position === "" ? undefined : data.position,
			};

			// Prepare employee data for API
			const employeeData = {
				name: formattedData.name,
				email: formattedData.email,
				phone: formattedData.phone,
				position: formattedData.position,
				// Only include hire_date if it's a non-empty string
				hireDate:
					formattedData.hireDate && formattedData.hireDate.trim() !== ""
						? formattedData.hireDate
						: undefined,
				address: formattedData.address,
				emergencyContact: formattedData.emergencyContact,
				notes: formattedData.notes,
				hourlyRate: formattedData.hourlyRate,
				organizationId,
				role: "Employee", // Required field for the Employee type
				status: "invited",
				isOnline: false,
				lastActive: new Date().toISOString(),
			};

			let employee: Employee;

			if (isEditing && initialData) {
				// Update existing employee
				const result = await EmployeesAPI.update(initialData.id, employeeData);
				if (!result) {
					toast.error("Failed to update employee. Please try again.");
					throw new Error("Failed to update employee");
				}
				employee = result;
				toast.success(`Successfully updated ${employee.name}'s information`);
			} else {
				// Create new employee
				try {
					employee = await EmployeesAPI.create(
						employeeData as Omit<Employee, "id">
					);
					toast.success(
						`Successfully added ${employee.name} to your organization`
					);
				} catch (error) {
					// Check for duplicate email error
					if (
						error instanceof Error &&
						error.message?.includes("duplicate key")
					) {
						toast.error("An employee with this email already exists");
						form.setError("email", {
							type: "manual",
							message: "An employee with this email already exists",
						});
						throw error;
					}
					toast.error("Failed to add employee. Please try again.");
					throw error;
				}
			}

			if (!isEditing) {
				// Reset only some fields after successful creation
				form.reset({
					name: "",
					email: "",
					phone: "",
					position: undefined,
					hourlyRate: "",
					// Preserve some fields that might be similar for batch adding
					hireDate: form.getValues("hireDate"),
					address: form.getValues("address"),
					emergencyContact: "",
					notes: "",
				});
			}

			if (onSuccess) {
				onSuccess(employee);
			}
		} catch (error) {
			console.error(
				`Error ${isEditing ? "updating" : "creating"} employee:`,
				error
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{isEditing ? "Edit Employee" : "Add New Employee"}
				</CardTitle>
				<CardDescription>
					{isEditing
						? "Update employee information"
						: "Enter employee details to add them to your organization"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6">
						<FormSection
							title="Basic Information"
							description="Enter the employee's name and primary contact details">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

						<div className="pt-4">
							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting}>
								{isSubmitting
									? isEditing
										? "Updating..."
										: "Adding..."
									: isEditing
									? "Update Employee"
									: "Add Employee"}
							</Button>
							{Object.keys(form.formState.errors).length > 0 && (
								<p className="mt-2 text-sm text-destructive text-center">
									Please fix the validation errors before submitting.
								</p>
							)}
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
