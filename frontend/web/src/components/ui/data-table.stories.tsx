import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";

// Sample data type
type Person = {
	id: number;
	name: string;
	email: string;
	role: string;
	status: "active" | "inactive";
};

// Sample data
const data: Person[] = [
	{
		id: 1,
		name: "John Doe",
		email: "john@example.com",
		role: "Admin",
		status: "active",
	},
	{
		id: 2,
		name: "Jane Smith",
		email: "jane@example.com",
		role: "User",
		status: "active",
	},
	{
		id: 3,
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "Editor",
		status: "inactive",
	},
	{
		id: 4,
		name: "Alice Brown",
		email: "alice@example.com",
		role: "User",
		status: "active",
	},
	{
		id: 5,
		name: "Charlie Wilson",
		email: "charlie@example.com",
		role: "Admin",
		status: "inactive",
	},
];

// Column definitions
const columns: ColumnDef<Person>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<div
				className={`px-2 py-1 rounded-full text-xs font-medium ${
					row.getValue("status") === "active"
						? "bg-green-100 text-green-800"
						: "bg-red-100 text-red-800"
				}`}>
				{row.getValue("status")}
			</div>
		),
	},
];

const meta: Meta<typeof DataTable<Person, unknown>> = {
	title: "UI/DataTable",
	component: DataTable,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable<Person, unknown>>;

export const Default: Story = {
	args: {
		columns,
		data,
	},
};

export const WithSearch: Story = {
	args: {
		columns,
		data,
		searchKey: "name",
		searchPlaceholder: "Search by name...",
	},
};

export const WithoutPagination: Story = {
	args: {
		columns,
		data,
		hidePagination: true,
	},
};

export const WithManyRows: Story = {
	args: {
		columns,
		data: Array.from({ length: 50 }, (_, i) => ({
			id: i + 1,
			name: `Person ${i + 1}`,
			email: `person${i + 1}@example.com`,
			role: ["Admin", "User", "Editor"][Math.floor(Math.random() * 3)],
			status: Math.random() > 0.5 ? "active" : "inactive",
		})),
		searchKey: "name",
	},
};
