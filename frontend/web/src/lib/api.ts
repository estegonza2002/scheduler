// API base URL - should be configured from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Types
export interface Shift {
	id: string;
	title: string;
	start_time: string;
	end_time: string;
	user_id?: string;
	schedule_id: string;
	organization_id: string;
	created_at: string;
	updated_at: string;
}

export interface Schedule {
	id: string;
	name: string;
	start_date: string;
	end_date: string;
	organization_id: string;
	created_at: string;
	updated_at: string;
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

export const SchedulesAPI = {
	getAll: async (organizationId?: string) => {
		const queryParams = organizationId
			? `?organizationId=${organizationId}`
			: "";
		const response = await fetch(`${API_URL}/schedules${queryParams}`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	getById: async (id: string) => {
		const response = await fetch(`${API_URL}/schedules/${id}`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	create: async (scheduleData: Partial<Schedule>) => {
		const response = await fetch(`${API_URL}/schedules`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(scheduleData),
		});
		return handleResponse(response);
	},

	update: async (id: string, scheduleData: Partial<Schedule>) => {
		const response = await fetch(`${API_URL}/schedules/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(scheduleData),
		});
		return handleResponse(response);
	},

	delete: async (id: string) => {
		const response = await fetch(`${API_URL}/schedules/${id}`, {
			method: "DELETE",
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	getShifts: async (scheduleId: string) => {
		const response = await fetch(`${API_URL}/schedules/${scheduleId}/shifts`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},
};

export const ShiftsAPI = {
	getAll: async (filters?: {
		organizationId?: string;
		userId?: string;
		scheduleId?: string;
	}) => {
		const queryParams = new URLSearchParams();
		if (filters?.organizationId)
			queryParams.append("organizationId", filters.organizationId);
		if (filters?.userId) queryParams.append("userId", filters.userId);
		if (filters?.scheduleId)
			queryParams.append("scheduleId", filters.scheduleId);

		const queryString = queryParams.toString()
			? `?${queryParams.toString()}`
			: "";
		const response = await fetch(`${API_URL}/shifts${queryString}`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	getById: async (id: string) => {
		const response = await fetch(`${API_URL}/shifts/${id}`, {
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	create: async (shiftData: Partial<Shift>) => {
		const response = await fetch(`${API_URL}/shifts`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(shiftData),
		});
		return handleResponse(response);
	},

	update: async (id: string, shiftData: Partial<Shift>) => {
		const response = await fetch(`${API_URL}/shifts/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify(shiftData),
		});
		return handleResponse(response);
	},

	delete: async (id: string) => {
		const response = await fetch(`${API_URL}/shifts/${id}`, {
			method: "DELETE",
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},

	assignUser: async (shiftId: string, userId: string) => {
		const response = await fetch(`${API_URL}/shifts/${shiftId}/assign`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeader(),
			} as HeadersInit,
			body: JSON.stringify({ userId }),
		});
		return handleResponse(response);
	},

	unassignUser: async (shiftId: string) => {
		const response = await fetch(`${API_URL}/shifts/${shiftId}/unassign`, {
			method: "PUT",
			headers: getAuthHeader() as HeadersInit,
		});
		return handleResponse(response);
	},
};
