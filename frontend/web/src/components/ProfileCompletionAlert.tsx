import { Employee } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfileCompletionStatus } from "@/utils/profile-completion";
import { AlertCircle, ExternalLink } from "lucide-react";

interface ProfileCompletionAlertProps {
	employee: Employee;
	onEdit?: () => void;
}

export function ProfileCompletionAlert({
	employee,
	onEdit,
}: ProfileCompletionAlertProps) {
	const { isComplete, missingHighPriority, missingCount, missingFields } =
		getProfileCompletionStatus(employee);

	// If no missing fields, return null
	if (isComplete) {
		return null;
	}

	return (
		<Alert
			className={`mb-6 ${
				missingHighPriority
					? "border-red-200 bg-red-50"
					: "border-amber-200 bg-amber-50"
			}`}>
			<AlertCircle
				className={`h-4 w-4 ${
					missingHighPriority ? "text-red-500" : "text-amber-500"
				}`}
			/>
			<AlertTitle className="flex items-center justify-between text-base">
				<span
					className={missingHighPriority ? "text-red-800" : "text-amber-800"}>
					{missingHighPriority
						? "Important information missing"
						: "Profile incomplete"}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={onEdit}
					className={`h-8 px-3 py-0 ${
						missingHighPriority
							? "border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
							: "border-amber-200 bg-white text-amber-700 hover:bg-amber-50 hover:text-amber-800"
					}`}>
					Complete profile
				</Button>
			</AlertTitle>
			<AlertDescription
				className={`mt-1.5 ${
					missingHighPriority ? "text-red-700" : "text-amber-700"
				}`}>
				<div className="flex flex-wrap gap-2 mt-2">
					{missingFields.map((field) => (
						<Badge
							key={field.key as string}
							variant="outline"
							className={`text-xs px-2 py-0.5 ${
								field.priority === "high"
									? "bg-red-100 text-red-800 border-red-200"
									: "bg-amber-100 text-amber-700 border-amber-200"
							}`}>
							{field.label}
						</Badge>
					))}
				</div>
			</AlertDescription>
		</Alert>
	);
}
