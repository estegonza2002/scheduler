import { useState } from "react";
import { Employee, EmployeesAPI } from "../api";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Upload, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Define the maximum number of employees that can be uploaded at once
const MAX_EMPLOYEES = 100;

interface BulkEmployeeUploadProps {
	organizationId: string;
	onSuccess?: (employees: Employee[]) => void;
}

interface EmployeePreview {
	name: string;
	email: string;
	phone?: string;
	hourlyRate?: string;
}

export function BulkEmployeeUpload({
	organizationId,
	onSuccess,
}: BulkEmployeeUploadProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [csvData, setCsvData] = useState("");
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<EmployeePreview[]>([]);

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

		if (data.trim()) {
			parseCSV(data);
		} else {
			setPreview([]);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError(null);
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
			const createdEmployees = await EmployeesAPI.bulkCreate(
				employees.map((emp) => ({
					...emp,
					organizationId,
					hourlyRate: emp.hourlyRate ? parseFloat(emp.hourlyRate) : undefined,
				}))
			);

			setCsvData("");
			setCsvFile(null);
			setPreview([]);

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

	return (
		<div className="space-y-4">
			<Alert
				variant="destructive"
				className="mb-4">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					<strong>Important:</strong> Bulk upload only supports 4 columns: Name,
					Email, Phone, and Hourly Rate. Other employee information must be
					added individually after upload.
				</AlertDescription>
			</Alert>

			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-medium">Bulk Add Employees</h3>
					<p className="text-sm text-muted-foreground">
						Upload up to {MAX_EMPLOYEES} employees at once
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={downloadSampleCSV}>
					<FileText className="h-4 w-4 mr-2" />
					Download Template
				</Button>
			</div>

			<Tabs defaultValue="paste">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="paste">Paste CSV</TabsTrigger>
					<TabsTrigger value="upload">Upload File</TabsTrigger>
				</TabsList>

				<TabsContent
					value="paste"
					className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="csv-input">Paste CSV Data</Label>
						<Textarea
							id="csv-input"
							placeholder="Format: name,email,phone,hourlyRate (only these 4 columns allowed)"
							className="h-32 font-mono"
							value={csvData}
							onChange={handleCSVChange}
						/>
					</div>
				</TabsContent>

				<TabsContent
					value="upload"
					className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="csv-file">Upload CSV File</Label>
						<div className="flex items-center gap-3">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => document.getElementById("csv-file")?.click()}>
								<Upload className="mr-2 h-4 w-4" />
								{csvFile ? csvFile.name : "Select File"}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={downloadSampleCSV}
								title="Download Sample Template">
								<FileText className="h-4 w-4" />
							</Button>
						</div>
						<input
							id="csv-file"
							type="file"
							accept=".csv"
							className="hidden"
							onChange={handleFileChange}
						/>
					</div>
				</TabsContent>
			</Tabs>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{preview.length > 0 && (
				<div className="border rounded-md">
					<div className="p-4 border-b bg-muted/30">
						<h3 className="font-medium">
							Preview ({preview.length}{" "}
							{preview.length === 1 ? "employee" : "employees"})
							{preview.length > 0 && (
								<span className="text-xs text-muted-foreground ml-2">
									Maximum: {MAX_EMPLOYEES} employees per upload
								</span>
							)}
						</h3>
					</div>
					<div className="p-0 max-h-64 overflow-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50 sticky top-0">
								<tr className="text-left">
									<th className="px-4 py-2">Name</th>
									<th className="px-4 py-2">Email</th>
									<th className="px-4 py-2">Phone</th>
									<th className="px-4 py-2">Hourly Rate</th>
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
				</div>
			)}

			<Button
				onClick={handleSubmit}
				disabled={isSubmitting || preview.length === 0}
				className="w-full">
				{isSubmitting
					? "Adding Employees..."
					: `Add ${preview.length} Employees`}
			</Button>
		</div>
	);
}
