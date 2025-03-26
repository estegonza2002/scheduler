import { useState, useRef } from "react";
import { Location, LocationsAPI } from "../api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import {
	Upload,
	FileText,
	AlertCircle,
	CheckCircle,
	X,
	FileJson,
	Loader2,
	Info,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";

// Sample CSV template
const CSV_TEMPLATE = `name,address,city,state,zipCode,isActive,phone,email
"Main Office","123 Main St","New York","NY","10001","true","555-123-4567","office@example.com"
"Downtown Branch","456 Market St","San Francisco","CA","94103","true","555-987-6543","downtown@example.com"`;

// Sample JSON template
const JSON_TEMPLATE = `[
  {
    "name": "Main Office",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "isActive": true,
    "phone": "555-123-4567",
    "email": "office@example.com"
  },
  {
    "name": "Downtown Branch",
    "address": "456 Market St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94103",
    "isActive": true,
    "phone": "555-987-6543",
    "email": "downtown@example.com"
  }
]`;

interface BulkLocationImportProps {
	organizationId: string;
	onLocationsCreated?: (locations: Location[]) => void;
	onCancel?: () => void;
}

export function BulkLocationImport({
	organizationId,
	onLocationsCreated,
	onCancel,
}: BulkLocationImportProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [parseError, setParseError] = useState<string | null>(null);
	const [importData, setImportData] = useState<Omit<Location, "id">[]>([]);
	const [fileName, setFileName] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Parse CSV function
	const parseCSV = (csvText: string): Omit<Location, "id">[] => {
		try {
			// Split by lines and filter out empty lines
			const lines = csvText
				.split(/\r?\n/)
				.filter((line) => line.trim().length > 0);

			if (lines.length < 2) {
				throw new Error(
					"CSV file must have a header row and at least one data row"
				);
			}

			// Parse header
			const headers = lines[0]
				.split(",")
				.map((h) => h.trim().replace(/^["'](.*)["']$/, "$1"));

			// Validate required headers
			if (!headers.includes("name")) {
				throw new Error("CSV file must include a 'name' column");
			}

			// Parse data rows
			const locations: Omit<Location, "id">[] = [];

			for (let i = 1; i < lines.length; i++) {
				if (!lines[i].trim()) continue;

				// Handle quoted values with commas inside
				const row: string[] = [];
				let inQuote = false;
				let currentValue = "";

				for (let char of lines[i]) {
					if (char === '"' && inQuote) {
						inQuote = false;
						continue;
					} else if (char === '"' && !inQuote) {
						inQuote = true;
						continue;
					}

					if (char === "," && !inQuote) {
						row.push(currentValue.trim().replace(/^["'](.*)["']$/, "$1"));
						currentValue = "";
					} else {
						currentValue += char;
					}
				}

				row.push(currentValue.trim().replace(/^["'](.*)["']$/, "$1"));

				// Create location object
				const location: any = { organizationId };

				headers.forEach((header, index) => {
					if (row[index] !== undefined && row[index] !== "") {
						if (header === "isActive") {
							location[header] = row[index].toLowerCase() === "true";
						} else {
							location[header] = row[index];
						}
					}
				});

				// Validate that name exists
				if (!location.name) {
					throw new Error(`Row ${i + 1} is missing a name`);
				}

				locations.push(location as Omit<Location, "id">);
			}

			return locations;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error parsing CSV: ${error.message}`);
			}
			throw new Error("Unknown error parsing CSV");
		}
	};

	// Parse JSON function
	const parseJSON = (jsonText: string): Omit<Location, "id">[] => {
		try {
			const parsed = JSON.parse(jsonText);

			if (!Array.isArray(parsed)) {
				throw new Error("JSON must be an array of location objects");
			}

			const locations: Omit<Location, "id">[] = parsed.map((item, index) => {
				if (!item.name) {
					throw new Error(`Location at index ${index} is missing a name`);
				}

				return {
					organizationId,
					name: item.name,
					address: item.address,
					city: item.city,
					state: item.state,
					zipCode: item.zipCode,
					isActive: item.isActive !== false, // Default to true if undefined
					phone: item.phone,
					email: item.email,
				};
			});

			return locations;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error parsing JSON: ${error.message}`);
			}
			throw new Error("Unknown error parsing JSON");
		}
	};

	// Handle file upload
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		setParseError(null);
		setImportData([]);

		const file = event.target.files?.[0];
		if (!file) return;

		setFileName(file.name);
		setIsUploading(true);

		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const content = e.target?.result as string;
				let locations: Omit<Location, "id">[] = [];

				if (file.name.endsWith(".csv")) {
					locations = parseCSV(content);
				} else if (file.name.endsWith(".json")) {
					locations = parseJSON(content);
				} else {
					throw new Error(
						"Unsupported file format. Please upload a CSV or JSON file."
					);
				}

				setImportData(locations);
			} catch (error) {
				if (error instanceof Error) {
					setParseError(error.message);
				} else {
					setParseError("An unknown error occurred while parsing the file");
				}
			} finally {
				setIsUploading(false);
			}
		};

		reader.onerror = () => {
			setParseError("Error reading file");
			setIsUploading(false);
		};

		reader.readAsText(file);
	};

	// Import locations
	const handleImport = async () => {
		if (importData.length === 0) return;

		try {
			setIsProcessing(true);
			const createdLocations = await LocationsAPI.createBulk(importData);

			if (onLocationsCreated) {
				onLocationsCreated(createdLocations);
			}

			toast.success(
				`Successfully imported ${createdLocations.length} locations`
			);
			setImportData([]);
			setFileName(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
		} catch (error) {
			console.error("Error importing locations:", error);
			toast.error("Failed to import locations");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDownloadTemplate = (format: "csv" | "json") => {
		const template = format === "csv" ? CSV_TEMPLATE : JSON_TEMPLATE;
		const blob = new Blob([template], {
			type: format === "csv" ? "text/csv" : "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download =
			format === "csv" ? "locations_template.csv" : "locations_template.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const resetForm = () => {
		setImportData([]);
		setFileName(null);
		setParseError(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Bulk Import Locations</CardTitle>
					<CardDescription>
						Upload a CSV or JSON file with multiple locations to import them all
						at once.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center gap-4">
						<div className="grid w-full gap-1.5">
							<Input
								type="file"
								accept=".csv,.json"
								ref={fileInputRef}
								onChange={handleFileUpload}
								disabled={isUploading || isProcessing}
							/>
						</div>
					</div>

					{isUploading && (
						<div className="flex items-center gap-2 text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Processing file...</span>
						</div>
					)}

					{parseError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{parseError}</AlertDescription>
						</Alert>
					)}

					{importData.length > 0 && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									{fileName} • <strong>{importData.length}</strong> locations
									ready to import
								</span>
							</div>

							<ScrollArea className="h-[300px] border rounded-md">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-16">Index</TableHead>
											<TableHead>Name</TableHead>
											<TableHead>Address</TableHead>
											<TableHead>City</TableHead>
											<TableHead>State</TableHead>
											<TableHead>ZIP</TableHead>
											<TableHead className="w-16">Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{importData.map((location, index) => (
											<TableRow key={index}>
												<TableCell className="text-muted-foreground">
													{index + 1}
												</TableCell>
												<TableCell>{location.name}</TableCell>
												<TableCell>{location.address || "-"}</TableCell>
												<TableCell>{location.city || "-"}</TableCell>
												<TableCell>{location.state || "-"}</TableCell>
												<TableCell>{location.zipCode || "-"}</TableCell>
												<TableCell>
													{location.isActive !== false ? (
														<Badge
															variant="outline"
															className="bg-green-50 text-green-700 hover:bg-green-50">
															Active
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="bg-gray-50 text-gray-700 hover:bg-gray-50">
															Inactive
														</Badge>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</ScrollArea>
						</div>
					)}

					<div className="space-y-3">
						<Alert className="bg-primary/5 border-primary/20">
							<Info className="h-4 w-4 text-primary" />
							<AlertTitle>Template Files</AlertTitle>
							<AlertDescription>
								Use these templates as a starting point for creating your import
								file. You'll need to include at least the name field for each
								location.
							</AlertDescription>
						</Alert>

						<div className="flex gap-3">
							<Button
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={() => handleDownloadTemplate("csv")}>
								<FileText className="h-4 w-4 mr-2 text-blue-600" />
								Download CSV Template
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={() => handleDownloadTemplate("json")}>
								<FileJson className="h-4 w-4 mr-2 text-amber-600" />
								Download JSON Template
							</Button>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button
						variant="outline"
						onClick={() => {
							resetForm();
							if (onCancel) onCancel();
						}}
						disabled={isProcessing}>
						Cancel
					</Button>
					<Button
						onClick={handleImport}
						disabled={importData.length === 0 || isProcessing}>
						{isProcessing ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Importing...
							</>
						) : (
							<>
								Import{" "}
								{importData.length > 0 ? `${importData.length} Locations` : ""}
							</>
						)}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
