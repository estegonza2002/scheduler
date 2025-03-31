import { z } from "zod";

export const employeeSchema = z.object({
	id: z.string().optional(),
	organizationId: z.string().optional(),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
	address: z.string().optional(),
	position: z.string().optional(),
	hourlyRate: z.number().min(0, "Hourly rate must be positive").optional(),
	hireDate: z.string().optional(),
	emergencyContact: z.string().optional(),
	notes: z.string().optional(),
	avatar: z.string().optional(),
	status: z.string().optional(),
	isOnline: z.boolean().optional(),
	lastActive: z.string().optional(),
	custom_properties: z.record(z.unknown()).optional(),
});

export type Employee = z.infer<typeof employeeSchema>;
