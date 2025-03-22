import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Employee, EmployeesAPI } from "../api";
import { Button } from "./ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const employeeFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional(),
	position: z.string().optional(),
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
			position: initialData?.position || "",
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
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4">
				<div className="space-y-4">
					<h3 className="text-sm font-medium text-muted-foreground">
						Basic Information
					</h3>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input
											placeholder="John Doe"
											{...field}
										/>
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
										<Input
											placeholder="john@example.com"
											type="email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-sm font-medium text-muted-foreground">
						Contact Information
					</h3>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<Input
											placeholder="555-123-4567"
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
											placeholder="123 Main St, Anytown, ST"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-sm font-medium text-muted-foreground">
						Employment Details
					</h3>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="position"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Position</FormLabel>
									<FormControl>
										<Input
											placeholder="Barista, Manager, etc."
											{...field}
										/>
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
										<Input
											type="number"
											step="0.01"
											min="0"
											placeholder="15.50"
											{...field}
										/>
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
										<Input
											type="date"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-sm font-medium text-muted-foreground">
						Additional Information
					</h3>
					<FormField
						control={form.control}
						name="emergencyContact"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Emergency Contact</FormLabel>
								<FormControl>
									<Input
										placeholder="Name (Relationship) - Phone"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Notes</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Additional information about this employee..."
										className="h-24"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

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
			</form>
		</Form>
	);
}
