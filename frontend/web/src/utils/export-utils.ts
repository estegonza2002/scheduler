/**
 * Export utilities for generating CSV, Excel, and PDF downloads
 */

/**
 * Formats and downloads data as a CSV file
 * @param data Array of objects to export
 * @param filename The name of the file to download (without extension)
 * @param headers Optional custom headers (defaults to object keys)
 */
export function exportToCSV<T extends Record<string, any>>(
	data: T[],
	filename: string,
	headers?: string[]
): void {
	if (!data || data.length === 0) {
		console.warn("No data to export");
		return;
	}

	// Use provided headers or extract from first data item
	const columnHeaders = headers || Object.keys(data[0]);

	// Create CSV header row
	let csvContent = columnHeaders.join(",") + "\n";

	// Add data rows
	data.forEach((item) => {
		const row = columnHeaders.map((header) => {
			// Handle special characters and ensure proper CSV formatting
			const value = item[header] !== undefined ? String(item[header]) : "";
			// Escape quotes and wrap in quotes if contains commas or quotes
			const escaped = value.replace(/"/g, '""');
			return /[",\n\r]/.test(value) ? `"${escaped}"` : value;
		});
		csvContent += row.join(",") + "\n";
	});

	// Create and trigger download
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", `${filename}.csv`);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Formats and downloads data as an Excel file
 * Uses a simple HTML table approach that Excel can parse
 * @param data Array of objects to export
 * @param filename The name of the file to download (without extension)
 * @param headers Optional custom headers (defaults to object keys)
 */
export function exportToExcel<T extends Record<string, any>>(
	data: T[],
	filename: string,
	headers?: string[]
): void {
	if (!data || data.length === 0) {
		console.warn("No data to export");
		return;
	}

	// Use provided headers or extract from first data item
	const columnHeaders = headers || Object.keys(data[0]);

	// Create HTML table for Excel
	let html = '<table border="1">\n';

	// Add header row
	html += "<tr>";
	columnHeaders.forEach((header) => {
		html += `<th>${header}</th>`;
	});
	html += "</tr>\n";

	// Add data rows
	data.forEach((item) => {
		html += "<tr>";
		columnHeaders.forEach((header) => {
			const value = item[header] !== undefined ? String(item[header]) : "";
			html += `<td>${value}</td>`;
		});
		html += "</tr>\n";
	});

	html += "</table>";

	// Create Excel file with HTML table
	const blob = new Blob([html], { type: "application/vnd.ms-excel" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", `${filename}.xls`);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Formats and transforms data specifically for export
 * Can be used to format dates, numbers, etc. before exporting
 * @param data The raw data to format
 * @param formatters Object of field formatters
 * @returns Formatted data
 */
export function formatExportData<T extends Record<string, any>>(
	data: T[],
	formatters: { [K in keyof Partial<T>]: (value: T[K]) => any }
): Record<string, any>[] {
	if (!data || data.length === 0) return [];

	return data.map((item) => {
		const formattedItem = { ...item };
		(Object.keys(formatters) as Array<keyof T>).forEach((key) => {
			if (item[key] !== undefined) {
				const formatter = formatters[key as keyof typeof formatters];
				if (formatter) {
					formattedItem[key] = formatter(item[key]);
				}
			}
		});
		return formattedItem;
	});
}
