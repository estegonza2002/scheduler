import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
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
import { ContentContainer } from "./ui/content-container";
import { EmptyState } from "./ui/empty-state";
import { LoadingState } from "./ui/loading-state";
import { Building2, Plus, CalendarDays } from "lucide-react";

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

	if (error) {
		return (
			<>
				<ContentContainer>
					<EmptyState
						title="Error loading organizations"
						description={error}
						icon={<Building2 className="h-6 w-6" />}
						action={
							<Button onClick={() => window.location.reload()}>
								Try Again
							</Button>
						}
					/>
				</ContentContainer>
			</>
		);
	}

	return (
		<>
			<ContentContainer>
				{loading && organizations.length === 0 ? (
					<LoadingState
						message="Loading organizations..."
						type="skeleton"
						skeletonCount={3}
						skeletonHeight={120}
					/>
				) : organizations.length === 0 ? (
					<EmptyState
						title="No organizations found"
						description="Create your first organization to get started"
						icon={<Building2 className="h-6 w-6" />}
						action={
							<Button onClick={() => setCreateOrgOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Create Organization
							</Button>
						}
					/>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{organizations.map((org) => (
							<Card
								key={org.id}
								className="hover:shadow-md transition-shadow">
								<CardHeader>
									<CardTitle>{org.name}</CardTitle>
									<CardDescription>
										{org.description || "No description provided"}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground line-clamp-2">
										{org.description || "No description provided"}
									</p>
								</CardContent>
								<CardFooter className="flex justify-between gap-2">
									<Button
										variant="outline"
										className="flex-1"
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
											<Button
												variant="secondary"
												className="flex-1">
												<CalendarDays className="h-4 w-4 mr-2" />
												Create Schedule
											</Button>
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
			</ContentContainer>
		</>
	);
}
