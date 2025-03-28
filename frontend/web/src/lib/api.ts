// API base URL - should be configured from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Import and re-export the ShiftsAPI and types from our new implementation
import {
	ShiftsAPI,
	Shift,
	Schedule,
	isSchedule,
	ShiftTask,
	ShiftCreateInput,
	ScheduleCreateInput,
	ShiftItemCreateInput,
	SchedulesAPI,
} from "@/api";

export { ShiftsAPI, isSchedule, SchedulesAPI };
export type {
	Shift,
	Schedule,
	ShiftTask,
	ShiftCreateInput,
	ScheduleCreateInput,
	ShiftItemCreateInput,
};

// Keep the old types for now to avoid breaking changes
// These can be refactored in the future to use the new consolidated model

export interface Notification {
	id: string;
	userId: string;
	organizationId: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	isActionRequired?: boolean;
	actionUrl?: string;
	relatedEntityId?: string;
	relatedEntityType?: string;
	createdAt: string;
}

export interface Organization {
	id: string;
	name: string;
	subscriptionPlan: "free" | "pro" | "business";
	created_at: string;
	updated_at: string;
}

export interface Employee {
	id: string;
	name: string;
	email: string;
	phone?: string;
	role?: string;
	organization_id: string;
	created_at: string;
	updated_at: string;
}

export interface Location {
	id: string;
	name: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	organization_id: string;
	created_at: string;
	updated_at: string;
	imageUrl?: string;
}

// Error handling
const handleResponse = async (response: Response) => {
	if (!response.ok) {
		const error = await response.json().catch(() => null);
		throw new Error(
			error?.message || "Something went wrong with the API request"
		);
	}
	return response.json();
};

// Authorization header
const getAuthHeader = () => {
	const token = localStorage.getItem("token");
	return token ? { Authorization: `Bearer ${token}` } : {};
};

// API Services
export const AuthAPI = {
	login: async (email: string, password: string) => {
		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

		const data = await handleResponse(response);
		if (data.access_token) {
			localStorage.setItem("token", data.access_token);
		}
		return data;
	},

	register: async (userData: any) => {
		const response = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});
		return handleResponse(response);
	},

	logout: () => {
		localStorage.removeItem("token");
	},

	getCurrentUser: async () => {
		const response = await fetch(`${API_URL}/auth/me`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},
};

// The SchedulesAPI is now imported directly from src/api
// We're keeping the other API implementations for backward compatibility

export const NotificationsAPI = {
	getAll: async (userId: string) => {
		const response = await fetch(`${API_URL}/notifications?userId=${userId}`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	getUnread: async (userId: string) => {
		const response = await fetch(
			`${API_URL}/notifications/unread?userId=${userId}`,
			{
				headers: getAuthHeader() as HeadersInit,
			}
		);
		return handleResponse(response);
	},

	markAsRead: async (id: string) => {
		const response = await fetch(`${API_URL}/notifications/${id}/read`, {
			method: "PUT",
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	markAllAsRead: async (userId: string) => {
		const response = await fetch(
			`${API_URL}/notifications/mark-all-read?userId=${userId}`,
			{
				method: "PUT",
				headers: getAuthHeader() as HeadersInit,
			}
		);
		return handleResponse(response);
	},

	dismissNotification: async (id: string) => {
		const response = await fetch(`${API_URL}/notifications/${id}`, {
			method: "DELETE",
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	dismissAllNotifications: async (userId: string) => {
		const response = await fetch(
			`${API_URL}/notifications/dismiss-all?userId=${userId}`,
			{
				method: "DELETE",
				headers: getAuthHeader() as HeadersInit,
			}
		);
		return handleResponse(response);
	},
};

export const OrganizationsAPI = {
	getAll: async () => {
		const response = await fetch(`${API_URL}/organizations`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	getById: async (id: string) => {
		const response = await fetch(`${API_URL}/organizations/${id}`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	create: async (organizationData: Partial<Organization>) => {
		const response = await fetch(`${API_URL}/organizations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(organizationData),
		});
		return handleResponse(response);
	},

	update: async (id: string, organizationData: Partial<Organization>) => {
		const response = await fetch(`${API_URL}/organizations/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(organizationData),
		});
		return handleResponse(response);
	},

	delete: async (id: string) => {
		const response = await fetch(`${API_URL}/organizations/${id}`, {
			method: "DELETE",
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},
};

export const EmployeesAPI = {
	getAll: async (organizationId: string) => {
		const response = await fetch(
			`${API_URL}/employees?organizationId=${organizationId}`,
			{
				headers: getAuthHeader() as HeadersInit,
			}
		);
		return handleResponse(response);
	},

	getById: async (id: string) => {
		const response = await fetch(`${API_URL}/employees/${id}`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	create: async (employeeData: Partial<Employee>) => {
		const response = await fetch(`${API_URL}/employees`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(employeeData),
		});
		return handleResponse(response);
	},

	update: async (id: string, employeeData: Partial<Employee>) => {
		const response = await fetch(`${API_URL}/employees/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(employeeData),
		});
		return handleResponse(response);
	},

	delete: async (id: string) => {
		const response = await fetch(`${API_URL}/employees/${id}`, {
			method: "DELETE",
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},
};

export const LocationsAPI = {
	getAll: async (organizationId: string) => {
		const response = await fetch(
			`${API_URL}/locations?organizationId=${organizationId}`,
			{
				headers: getAuthHeader() as HeadersInit,
			}
		);
		return handleResponse(response);
	},

	getById: async (id: string) => {
		const response = await fetch(`${API_URL}/locations/${id}`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	create: async (locationData: Partial<Location>) => {
		const response = await fetch(`${API_URL}/locations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(locationData),
		});
		return handleResponse(response);
	},

	update: async (id: string, locationData: Partial<Location>) => {
		const response = await fetch(`${API_URL}/locations/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(locationData),
		});
		return handleResponse(response);
	},

	delete: async (id: string) => {
		const response = await fetch(`${API_URL}/locations/${id}`, {
			method: "DELETE",
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},
};
