import React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { exportToCSV, exportToExcel } from "../utils/export-utils";

interface ExportDropdownProps<T extends Record<string, any>> {
	data: T[];
	filename: string;
	headers?: string[];
	label?: string;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
}

export function ExportDropdown<T extends Record<string, any>>({
	data,
	filename,
	headers,
	label = "Export",
	variant = "outline",
	size = "default",
}: ExportDropdownProps<T>) {
	if (!data || data.length === 0) {
		return (
			<Button
				variant={variant}
				size={size}
				disabled>
				<Download className="mr-2 h-4 w-4" />
				{label}
			</Button>
		);
	}

	const handleCSVExport = () => {
		exportToCSV(data, filename, headers);
	};

	const handleExcelExport = () => {
		exportToExcel(data, filename, headers);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant={variant}
					size={size}>
					<Download className="mr-2 h-4 w-4" />
					{label}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onSelect={handleCSVExport}>
					<FileText className="mr-2 h-4 w-4" />
					<span>Export as CSV</span>
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={handleExcelExport}>
					<FileSpreadsheet className="mr-2 h-4 w-4" />
					<span>Export as Excel</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
