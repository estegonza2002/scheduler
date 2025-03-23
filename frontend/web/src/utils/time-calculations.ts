import { parseISO, differenceInHours, differenceInMinutes } from "date-fns";
import { Employee } from "../api";

// Calculate time difference in hours between two ISO date strings
export const calculateHours = (startTime: string, endTime: string) => {
	const start = parseISO(startTime);
	const end = parseISO(endTime);
	const hours = differenceInHours(end, start);
	const minutes = differenceInMinutes(end, start) % 60;

	return minutes > 0 ? `${hours}.${minutes}` : `${hours}`;
};

// Calculate shift total cost based on all employees' hourly rates
export const calculateTotalCost = (
	startTime: string,
	endTime: string,
	employees: Employee[] = []
) => {
	if (employees.length === 0) return "0.00";

	const start = parseISO(startTime);
	const end = parseISO(endTime);
	const hours = differenceInHours(end, start);
	const minutes = differenceInMinutes(end, start) % 60;
	const totalHours = hours + minutes / 60;

	// Sum up the cost for all assigned employees
	const totalCost = employees.reduce((sum, employee) => {
		if (!employee.hourlyRate) return sum;
		return sum + totalHours * employee.hourlyRate;
	}, 0);

	return totalCost.toFixed(2);
};

// Calculate individual employee cost
export const calculateEmployeeCost = (
	startTime: string,
	endTime: string,
	employee: Employee
) => {
	if (!employee.hourlyRate) return "0.00";

	const start = parseISO(startTime);
	const end = parseISO(endTime);
	const hours = differenceInHours(end, start);
	const minutes = differenceInMinutes(end, start) % 60;
	const totalHours = hours + minutes / 60;

	return (totalHours * employee.hourlyRate).toFixed(2);
};
