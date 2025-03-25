import { useState } from "react";
import { Employee, EmployeesAPI } from "../api";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
	AlertCircle,
	Upload,
	FileText,
	Table,
	Download,
	Info,
	CheckCircle,
	Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FormSection } from "./ui/form-section";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

// Define the maximum number of employees that can be uploaded at once
const MAX_EMPLOYEES = 100;

/**
 * Props for the BulkEmployeeUpload component
 */
interface BulkEmployeeUploadProps {
	/**
	 * The ID of the organization to add employees to
	 */
	organizationId: string;
	/**
	 * Optional callback fired when employees are successfully added
	 */
	onSuccess?: (employees: Employee[]) => void;
	/**
	 * Optional additional className for the component wrapper
	 */
	className?: string;
}

/**
 * Interface for the preview of an employee from CSV data
 */
interface EmployeePreview {
	name: string;
	email: string;
	phone?: string;
	hourlyRate?: string;
}

/**
 * Component for bulk uploading employees via CSV
 */
export function BulkEmployeeUpload({
	organizationId,
	onSuccess,
	className,
}: BulkEmployeeUploadProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [csvData, setCsvData] = useState("");
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<EmployeePreview[]>([]);
	const [uploadSuccess, setUploadSuccess] = useState(false);

	const parseCSV = (data: string) => {
		setError(null);

		try {
			// Parse CSV for employee data with only 4 allowed fields: name, email, phone, hourlyRate
			const rows = data.trim().split("\n");

			// Check if header row exists
			const hasHeader =
				rows[0].toLowerCase().includes("name") &&
				rows[0].toLowerCase().includes("email");

			const startIndex = hasHeader ? 1 : 0;
			const dataRows = rows.slice(startIndex);

			// Check if the number of employees exceeds the limit
			if (dataRows.length > MAX_EMPLOYEES) {
				throw new Error(
					`Too many employees (${dataRows.length}). Maximum limit is ${MAX_EMPLOYEES} employees per upload.`
				);
			}

			const parsed = dataRows.map((row) => {
				const columns = row.split(",").map((col) => col.trim());

				if (columns.length < 2) {
					throw new Error(
						`Invalid row format: ${row}. At minimum, name and email are required.`
					);
				}

				if (columns.length > 4) {
					throw new Error(
						`Too many columns in row: ${row}. Only 4 columns are allowed: Name, Email, Phone, Hourly Rate.`
					);
				}

				// Build employee object with proper typing - only 4 allowed fields
				const employee: EmployeePreview = {
					name: columns[0],
					email: columns[1],
				};

				// Optional fields based on position in CSV - only phone and hourlyRate allowed
				if (columns.length > 2) employee.phone = columns[2] || undefined;
				if (columns.length > 3) employee.hourlyRate = columns[3] || undefined;

				return employee;
			});

			setPreview(parsed);
			return parsed;
		} catch (err) {
			setError(
				`Error parsing CSV: ${err instanceof Error ? err.message : String(err)}`
			);
			setPreview([]);
			return null;
		}
	};

	const handleCSVChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const data = e.target.value;
		setCsvData(data);
		setUploadSuccess(false);

		if (data.trim()) {
			parseCSV(data);
		} else {
			setPreview([]);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(null);
		setUploadSuccess(false);
		const file = e.target.files?.[0];

		if (!file) {
			setCsvFile(null);
			return;
		}

		if (!file.name.endsWith(".csv")) {
			setError("Please upload a CSV file");
			setCsvFile(null);
			return;
		}

		setCsvFile(file);

		// Read file contents
		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result as string;
			setCsvData(content);
			parseCSV(content);
		};
		reader.onerror = () => {
			setError("Error reading file");
		};
		reader.readAsText(file);
	};

	const handleSubmit = async () => {
		if (!csvData.trim()) {
			setError("Please enter or upload CSV data");
			return;
		}

		const employees = parseCSV(csvData);

		if (!employees || employees.length === 0) {
			setError("No valid employee data found");
			return;
		}

		if (employees.length > MAX_EMPLOYEES) {
			setError(
				`Too many employees (${employees.length}). Maximum limit is ${MAX_EMPLOYEES} employees per upload.`
			);
			return;
		}

		try {
			setIsSubmitting(true);
			setError(null);
			const createdEmployees = await EmployeesAPI.bulkCreate(
				employees.map((emp) => ({
					...emp,
					organizationId,
					hourlyRate: emp.hourlyRate ? parseFloat(emp.hourlyRate) : undefined,
				}))
			);

			setUploadSuccess(true);

			if (onSuccess) {
				onSuccess(createdEmployees);
			}
		} catch (error) {
			console.error("Error creating employees:", error);
			setError("Failed to create employees. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const downloadSampleCSV = () => {
		const sampleData =
			"# IMPORTANT: Only these 4 columns are supported: Name, Email, Phone, HourlyRate\n" +
			"# Other employee information must be added individually after upload\n" +
			"Name,Email,Phone,HourlyRate\n" +
			"John Doe,john@example.com,555-123-4567,15.50\n" +
			"Jane Smith,jane@example.com,555-234-5678,22.75";
		const blob = new Blob([sampleData], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "employee_template.csv";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const resetForm = () => {
		setCsvData("");
		setCsvFile(null);
		setPreview([]);
		setError(null);
		setUploadSuccess(false);
	};

	return (
		<div className={cn("space-y-6", className)}>
			<FormSection title="Bulk Employee Import">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<Upload className="h-5 w-5 text-primary" />
						<h3 className="text-lg font-medium">Bulk Import</h3>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge
									variant="outline"
									className="text-xs flex gap-1 items-center">
									<Info className="h-3 w-3" />
									<span>Max {MAX_EMPLOYEES} employees</span>
								</Badge>
							</TooltipTrigger>
							<TooltipContent>
								<p>You can upload up to {MAX_EMPLOYEES} employees at once</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<Separator className="my-2" />

				<Alert
					variant="destructive"
					className="mb-4">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Important</AlertTitle>
					<AlertDescription>
						Bulk upload only supports 4 columns:{" "}
						<strong>Name, Email, Phone, and Hourly Rate</strong>. Other employee
						information must be added individually after upload.
					</AlertDescription>
				</Alert>

				<div className="flex justify-end mb-2">
					<Button
						variant="outline"
						size="sm"
						onClick={downloadSampleCSV}
						className="flex items-center gap-2">
						<Download className="h-4 w-4" />
						<span>Download Template</span>
					</Button>
				</div>

				<Tabs
					defaultValue="paste"
					className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="paste">Paste CSV</TabsTrigger>
						<TabsTrigger value="upload">Upload File</TabsTrigger>
					</TabsList>

					<TabsContent
						value="paste"
						className="space-y-4 pt-2">
						<div className="grid gap-2">
							<Label
								htmlFor="csv-input"
								className="text-sm font-medium">
								Paste CSV Data
							</Label>
							<Textarea
								id="csv-input"
								placeholder="Format: name,email,phone,hourlyRate (only these 4 columns allowed)"
								className="h-32 font-mono text-sm"
								value={csvData}
								onChange={handleCSVChange}
								disabled={isSubmitting || uploadSuccess}
							/>
						</div>
					</TabsContent>

					<TabsContent
						value="upload"
						className="space-y-4 pt-2">
						<div className="grid gap-2">
							<Label
								htmlFor="csv-file"
								className="text-sm font-medium">
								Upload CSV File
							</Label>
							<div className="flex items-center gap-3">
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => document.getElementById("csv-file")?.click()}
									disabled={isSubmitting || uploadSuccess}>
									<Upload className="mr-2 h-4 w-4" />
									{csvFile ? csvFile.name : "Select File"}
								</Button>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={downloadSampleCSV}
												disabled={isSubmitting}>
												<FileText className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Download CSV Template</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<input
								id="csv-file"
								type="file"
								accept=".csv"
								className="hidden"
								onChange={handleFileChange}
								disabled={isSubmitting || uploadSuccess}
							/>
						</div>
					</TabsContent>
				</Tabs>

				{error && (
					<Alert
						variant="destructive"
						className="mt-4">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{uploadSuccess && (
					<Alert className="mt-4 bg-green-50 border-green-200">
						<CheckCircle className="h-4 w-4 text-green-500" />
						<AlertTitle className="text-green-700">Success</AlertTitle>
						<AlertDescription className="text-green-600">
							{preview.length} {preview.length === 1 ? "employee" : "employees"}{" "}
							added successfully.
						</AlertDescription>
					</Alert>
				)}
			</FormSection>

			{preview.length > 0 && (
				<FormSection
					title="Preview"
					description={`${preview.length} ${
						preview.length === 1 ? "employee" : "employees"
					} to be added`}>
					<ScrollArea className="h-64 w-full border rounded-md">
						<div className="p-0">
							<table className="w-full text-sm">
								<thead className="bg-muted/50 sticky top-0">
									<tr className="text-left">
										<th className="px-4 py-2 font-medium">Name</th>
										<th className="px-4 py-2 font-medium">Email</th>
										<th className="px-4 py-2 font-medium">Phone</th>
										<th className="px-4 py-2 font-medium">Hourly Rate</th>
									</tr>
								</thead>
								<tbody>
									{preview.map((employee, index) => (
										<tr
											key={index}
											className={
												index % 2 === 0 ? "bg-background" : "bg-muted/20"
											}>
											<td className="px-4 py-2 border-t">{employee.name}</td>
											<td className="px-4 py-2 border-t">{employee.email}</td>
											<td className="px-4 py-2 border-t">
												{employee.phone || "-"}
											</td>
											<td className="px-4 py-2 border-t">
												{employee.hourlyRate ? `$${employee.hourlyRate}` : "-"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</ScrollArea>
				</FormSection>
			)}

			<div className="flex flex-col sm:flex-row gap-2 mt-6">
				{uploadSuccess ? (
					<Button
						onClick={resetForm}
						variant="outline"
						className="w-full">
						<Upload className="mr-2 h-4 w-4" />
						Upload More Employees
					</Button>
				) : (
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || preview.length === 0}
						className="w-full">
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Adding Employees...
							</>
						) : (
							<>
								<CheckCircle className="mr-2 h-4 w-4" />
								Add {preview.length}{" "}
								{preview.length === 1 ? "Employee" : "Employees"}
							</>
						)}
					</Button>
				)}
			</div>
		</div>
	);
}
