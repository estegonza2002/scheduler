import { Employee } from "@/api";

// Interface for employee data with additional assignment information
export interface AssignedEmployee extends Employee {
	assignmentId: string;
	assignmentRole?: string;
	assignmentNotes?: string;
}
