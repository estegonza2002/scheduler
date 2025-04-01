export interface Organization {
	id: string;
	created_at: string;
	updated_at: string;
	name: string;
	description?: string;
	logo_url?: string;
	owner_id: string;
	website?: string;
	contactemail?: string;
	contactphone?: string;
	address?: string;
	country?: string;
	businesshours?: string;
	subscription_id?: string;
	subscription_status?: string;
	subscription_plan?: string;
	stripe_customer_id?: string;
}

export interface OrganizationCreateInput {
	name: string;
	description?: string;
	logo_url?: string;
	owner_id: string;
	website?: string;
	contactemail?: string;
	contactphone?: string;
	address?: string;
	country?: string;
	businesshours?: string;
}
