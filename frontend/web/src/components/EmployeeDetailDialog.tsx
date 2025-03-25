import { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogFooter,
} from "./ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Employee } from "../api";
import {
	Mail,
	Phone,
	Calendar,
	MapPin,
	User,
	Info,
	ClipboardList,
	AlertCircle,
	DollarSign,
	Building2,
	Briefcase,
	Clock,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { DialogHeader } from "./ui/dialog-header";

/**
 * Props for the EmployeeDetailDialog component
 */
interface EmployeeDetailDialogProps {
	/**
	 * The employee data to display details for
	 */
	employee: Employee;
	/**
	 * Optional custom trigger element
	 */
	trigger?: ReactNode;
	/**
	 * Controls whether the dialog is open
	 */
	open?: boolean;
	/**
	 * Callback fired when the open state changes
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Optional additional className for the dialog content
	 */
	className?: string;
}

/**
 * Dialog component for displaying detailed employee information
 */
export function EmployeeDetailDialog({
	employee,
	trigger,
	open,
	onOpenChange,
	className,
}: EmployeeDetailDialogProps) {
	// Generate user initials for the avatar
	const initials = employee.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	// Create title with icon for the dialog header
	const dialogTitle = (
		<>
			<User className="h-5 w-5 mr-2 text-primary" />
			Employee Profile
		</>
	);

	// Create badge for the role as action
	const headerActions = (
		<Badge
			className="ml-2"
			variant={employee.role === "admin" ? "default" : "outline"}>
			{employee.role || "Staff"}
		</Badge>
	);

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				{trigger || <Button variant="ghost">View Details</Button>}
			</DialogTrigger>
			<DialogContent
				className={cn(
					"sm:max-w-[600px] max-h-[90vh] flex flex-col",
					className
				)}>
				<DialogHeader
					title={dialogTitle as unknown as string}
					description={`Detailed information about ${employee.name}`}
					actions={headerActions}
					titleClassName="flex items-center"
					onClose={() => onOpenChange?.(false)}
				/>

				<ScrollArea className="flex-1 -mx-6 px-6">
					<div className="space-y-6 py-2">
						{/* Profile Header */}
						<div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
							<Avatar className="h-16 w-16">
								<AvatarImage
									src={employee.avatar}
									alt={employee.name}
								/>
								<AvatarFallback className="text-lg bg-primary/10 text-primary">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<h2 className="text-xl font-semibold">{employee.name}</h2>
								<p className="text-muted-foreground">
									{employee.position || employee.role}
								</p>
								{employee.hourlyRate !== undefined && (
									<div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
										<DollarSign className="h-3.5 w-3.5" />
										<span>${employee.hourlyRate.toFixed(2)}/hr</span>
									</div>
								)}
							</div>
						</div>

						{/* Sections Grid */}
						<div className="space-y-4">
							<h4 className="text-sm font-medium flex items-center">
								<Info className="h-4 w-4 mr-2 text-muted-foreground" />
								Employee Details
							</h4>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{/* Contact Section */}
								<div className="space-y-2 p-3 rounded-md border">
									<h5 className="text-sm font-medium flex items-center">
										<Mail className="h-4 w-4 mr-2 text-muted-foreground" />
										Contact Information
									</h5>
									<Separator className="my-1.5" />
									<div className="space-y-2 text-sm">
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-muted-foreground shrink-0" />
											<span className="overflow-hidden text-ellipsis">
												{employee.email}
											</span>
										</div>
										{employee.phone && (
											<div className="flex items-center gap-2">
												<Phone className="h-4 w-4 text-muted-foreground shrink-0" />
												<span>{employee.phone}</span>
											</div>
										)}
										{employee.address && (
											<div className="flex items-start gap-2">
												<MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
												<span className="line-clamp-2">{employee.address}</span>
											</div>
										)}
									</div>
								</div>

								{/* Employment Section */}
								<div className="space-y-2 p-3 rounded-md border">
									<h5 className="text-sm font-medium flex items-center">
										<Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
										Employment Details
									</h5>
									<Separator className="my-1.5" />
									<div className="space-y-2 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Position:</span>
											<span className="font-medium">
												{employee.position || "N/A"}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Role:</span>
											<span className="font-medium">
												{employee.role || "N/A"}
											</span>
										</div>
										{employee.hireDate && (
											<div className="flex items-center justify-between">
												<span className="text-muted-foreground">
													Hire Date:
												</span>
												<span className="font-medium">
													{new Date(employee.hireDate).toLocaleDateString()}
												</span>
											</div>
										)}
									</div>
								</div>

								{/* Emergency Contact Section */}
								{employee.emergencyContact && (
									<div className="space-y-2 p-3 rounded-md border">
										<h5 className="text-sm font-medium flex items-center">
											<AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
											Emergency Contact
										</h5>
										<Separator className="my-1.5" />
										<div className="space-y-1.5 text-sm">
											<p>{employee.emergencyContact}</p>
										</div>
									</div>
								)}

								{/* Organization Section */}
								<div className="space-y-2 p-3 rounded-md border">
									<h5 className="text-sm font-medium flex items-center">
										<Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
										Organization
									</h5>
									<Separator className="my-1.5" />
									<div className="space-y-1.5 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">ID:</span>
											<span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">
												{employee.organizationId}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Notes Section (Full Width) */}
							{employee.notes && (
								<div className="space-y-2 p-3 rounded-md border">
									<h5 className="text-sm font-medium flex items-center">
										<ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
										Notes
									</h5>
									<Separator className="my-1.5" />
									<div className="text-sm text-muted-foreground whitespace-pre-line">
										{employee.notes}
									</div>
								</div>
							)}
						</div>
					</div>
				</ScrollArea>

				<DialogFooter className="mt-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange?.(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
