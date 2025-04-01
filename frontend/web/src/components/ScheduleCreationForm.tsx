import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShiftsAPI } from "@/api";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface ScheduleCreationFormProps {
	organizationId: string;
	onSuccess?: () => void;
}

export function ScheduleCreationForm({
	organizationId,
	onSuccess,
}: ScheduleCreationFormProps) {
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm({
		defaultValues: {
			name: "",
			startDate: getCurrentDate(),
			endDate: getDefaultEndDate(),
		},
	});

	const onSubmit = async (data: {
		name: string;
		startDate: string;
		endDate: string;
	}) => {
		try {
			setLoading(true);

			await ShiftsAPI.createSchedule({
				name: data.name,
				organization_id: organizationId,
				start_time: data.startDate,
				end_time: data.endDate,
				is_schedule: true,
			});

			toast.success(`Schedule "${data.name}" created successfully`);

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error("Error creating schedule:", error);
			toast.error("Failed to create schedule");
		} finally {
			setLoading(false);
		}
	};

	function getCurrentDate() {
		const today = new Date();
		return today.toISOString().split("T")[0];
	}

	function getDefaultEndDate() {
		const today = new Date();
		const threeMonthsLater = new Date(today);
		threeMonthsLater.setMonth(today.getMonth() + 3);
		return threeMonthsLater.toISOString().split("T")[0];
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Schedule Name</Label>
				<Input
					id="name"
					placeholder="Summer Schedule 2024"
					{...register("name", { required: "Schedule name is required" })}
				/>
				{errors.name && (
					<p className="text-sm text-red-500">{errors.name.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="startDate">Start Date</Label>
				<div className="relative">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!watch("startDate") && "text-muted-foreground"
								)}>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{watch("startDate") ? (
									format(new Date(watch("startDate")), "PPP")
								) : (
									<span>Pick a date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-auto p-0"
							align="start">
							<Calendar
								mode="single"
								selected={
									watch("startDate") ? new Date(watch("startDate")) : undefined
								}
								onSelect={(date) => {
									if (date) {
										setValue("startDate", format(date, "yyyy-MM-dd"));
									}
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
					<Input
						id="startDate"
						type="date"
						className="hidden"
						{...register("startDate", { required: "Start date is required" })}
					/>
				</div>
				{errors.startDate && (
					<p className="text-sm text-red-500">{errors.startDate.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="endDate">End Date</Label>
				<div className="relative">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!watch("endDate") && "text-muted-foreground"
								)}>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{watch("endDate") ? (
									format(new Date(watch("endDate")), "PPP")
								) : (
									<span>Pick a date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-auto p-0"
							align="start">
							<Calendar
								mode="single"
								selected={
									watch("endDate") ? new Date(watch("endDate")) : undefined
								}
								onSelect={(date) => {
									if (date) {
										setValue("endDate", format(date, "yyyy-MM-dd"));
									}
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
					<Input
						id="endDate"
						type="date"
						className="hidden"
						{...register("endDate", { required: "End date is required" })}
					/>
				</div>
				{errors.endDate && (
					<p className="text-sm text-red-500">{errors.endDate.message}</p>
				)}
			</div>

			<Button
				type="submit"
				className="w-full"
				disabled={loading}>
				{loading ? "Creating..." : "Create Schedule"}
			</Button>
		</form>
	);
}
