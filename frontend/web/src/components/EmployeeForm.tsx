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

// Define available positions
const POSITIONS = ["Supervisor", "Runner"] as const;

const employeeFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional(),
	position: z.union([z.enum(POSITIONS), z.literal("")]).optional(),
	hireDate: z.string().optional(),
	address: z.string().optional(),
	emergencyContact: z.string().optional(),
	notes: z.string().optional(),
	hourlyRate: z.string().optional(),
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

			let employee: Employee;

			if (isEditing && initialData) {
				// Update existing employee
				employee = await EmployeesAPI.update(initialData.id, {
					...formattedData,
				});
			} else {
				// Create new employee
				employee = await EmployeesAPI.create({
					...formattedData,
					organizationId,
					status: "invited",
					isOnline: false,
					lastActive: new Date().toISOString(),
				});
			}

			if (!isEditing) {
				form.reset();
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
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<div className="flex items-center">
													<User className="w-4 h-4 mr-2 text-muted-foreground" />
													<Input
														placeholder="John Doe"
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
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<div className="flex items-center">
													<Mail className="w-4 h-4 mr-2 text-muted-foreground" />
													<Input
														placeholder="john@example.com"
														type="email"
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
							title="Contact Information"
							description="Add contact details for communication and record-keeping">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone Number</FormLabel>
											<FormControl>
												<div className="flex items-center">
													<Phone className="w-4 h-4 mr-2 text-muted-foreground" />
													<Input
														placeholder="555-123-4567"
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
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
