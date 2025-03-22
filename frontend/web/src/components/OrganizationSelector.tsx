import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ScheduleCreationForm } from "./ScheduleCreationForm";
import { Organization, OrganizationsAPI } from "../api";

interface OrganizationSelectorProps {
	onSelectOrganization: (organizationId: string) => void;
}

export function OrganizationSelector({
	onSelectOrganization,
}: OrganizationSelectorProps) {
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [createOrgOpen, setCreateOrgOpen] = useState(false);
	const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
	const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<{
		name: string;
		description: string;
	}>();

	useEffect(() => {
		const fetchOrganizations = async () => {
			try {
				setLoading(true);
				const data = await OrganizationsAPI.getAll();
				setOrganizations(data);
				setError(null);
			} catch (err) {
				setError("Failed to fetch organizations. Please try again.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchOrganizations();
	}, []);

	const handleCreateOrganization = async (data: {
		name: string;
		description: string;
	}) => {
		try {
			setLoading(true);
			const newOrg = await OrganizationsAPI.create({
				name: data.name,
				description: data.description,
			});

			setOrganizations((prev) => [...prev, newOrg]);
			setCreateOrgOpen(false);
			reset();
			toast.success(`Organization "${data.name}" created successfully`);
		} catch (err) {
			toast.error("Failed to create organization");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectOrg = (orgId: string) => {
		setSelectedOrgId(orgId);
		onSelectOrganization(orgId);
	};

	const handleScheduleCreated = () => {
		setCreateScheduleOpen(false);
		toast.success("Schedule created successfully");
	};

	if (loading && organizations.length === 0) {
		return (
			<div className="flex justify-center items-center min-h-[200px]">
				<div className="animate-pulse text-xl">Loading organizations...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 text-center">
				<div className="text-red-500 mb-4">{error}</div>
				<Button onClick={() => window.location.reload()}>Retry</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Select Organization</h1>
				<Dialog
					open={createOrgOpen}
					onOpenChange={setCreateOrgOpen}>
					<DialogTrigger asChild>
						<Button>Create Organization</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Organization</DialogTitle>
						</DialogHeader>
						<form
							onSubmit={handleSubmit(handleCreateOrganization)}
							className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Organization Name</Label>
								<Input
									id="name"
									placeholder="Enter organization name"
									{...register("name", { required: "Name is required" })}
								/>
								{errors.name && (
									<p className="text-sm text-red-500">{errors.name.message}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									placeholder="Enter organization description"
									{...register("description")}
								/>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={loading}>
								{loading ? "Creating..." : "Create Organization"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{organizations.length === 0 ? (
				<div className="text-center p-10 border rounded-lg">
					<p className="text-xl mb-4">No organizations found</p>
					<p className="mb-6">Create your first organization to get started</p>
					<Button onClick={() => setCreateOrgOpen(true)}>
						Create Organization
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{organizations.map((org) => (
						<Card
							key={org.id}
							className="hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle>{org.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									{org.description || "No description provided"}
								</p>
							</CardContent>
							<CardFooter className="flex justify-between">
								<Button
									variant="outline"
									onClick={() => handleSelectOrg(org.id)}>
									Select
								</Button>
								<Dialog
									open={createScheduleOpen && selectedOrgId === org.id}
									onOpenChange={(open) => {
										setCreateScheduleOpen(open);
										if (open) setSelectedOrgId(org.id);
									}}>
									<DialogTrigger asChild>
										<Button>Create Schedule</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Create New Schedule</DialogTitle>
										</DialogHeader>
										<ScheduleCreationForm
											organizationId={org.id}
											onSuccess={handleScheduleCreated}
										/>
									</DialogContent>
								</Dialog>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
