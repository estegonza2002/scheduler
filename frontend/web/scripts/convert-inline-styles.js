#!/usr/bin/env node

/**
 * Inline Style to Tailwind Converter
 *
 * This tool helps convert React inline styles to Tailwind CSS classes
 * by providing suggested Tailwind equivalents for common CSS properties.
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map of common CSS properties to Tailwind utility classes
const cssToTailwindMap = {
	// Spacing
	padding: (value) => `p-${convertSpacingToTailwind(value)}`,
	"padding-left": (value) => `pl-${convertSpacingToTailwind(value)}`,
	"padding-right": (value) => `pr-${convertSpacingToTailwind(value)}`,
	"padding-top": (value) => `pt-${convertSpacingToTailwind(value)}`,
	"padding-bottom": (value) => `pb-${convertSpacingToTailwind(value)}`,
	margin: (value) => `m-${convertSpacingToTailwind(value)}`,
	"margin-left": (value) => `ml-${convertSpacingToTailwind(value)}`,
	"margin-right": (value) => `mr-${convertSpacingToTailwind(value)}`,
	"margin-top": (value) => `mt-${convertSpacingToTailwind(value)}`,
	"margin-bottom": (value) => `mb-${convertSpacingToTailwind(value)}`,

	// Width/Height
	width: (value) => convertSizeToTailwind(value, "w"),
	height: (value) => convertSizeToTailwind(value, "h"),
	"min-width": (value) => convertSizeToTailwind(value, "min-w"),
	"max-width": (value) => convertSizeToTailwind(value, "max-w"),
	"min-height": (value) => convertSizeToTailwind(value, "min-h"),
	"max-height": (value) => convertSizeToTailwind(value, "max-h"),

	// Typography
	"font-size": (value) => convertFontSizeToTailwind(value),
	"font-weight": (value) => convertFontWeightToTailwind(value),
	"text-align": (value) => `text-${value}`,
	color: (value) => convertColorToTailwind(value),

	// Background
	"background-color": (value) => convertColorToTailwind(value, "bg"),

	// Borders
	border: (value) => `border ${convertBorderToTailwind(value)}`,
	"border-radius": (value) => convertBorderRadiusToTailwind(value),

	// Display
	display: (value) => value,

	// Flex
	"flex-direction": (value) => `flex-${value}`,
	"justify-content": (value) => convertJustifyContentToTailwind(value),
	"align-items": (value) => convertAlignItemsToTailwind(value),
	"flex-grow": (value) => (value === "1" ? "flex-grow" : `flex-grow-${value}`),
	"flex-shrink": (value) =>
		value === "1" ? "flex-shrink" : `flex-shrink-${value}`,

	// Position
	position: (value) => value,
	top: (value) => `top-${convertSpacingToTailwind(value)}`,
	right: (value) => `right-${convertSpacingToTailwind(value)}`,
	bottom: (value) => `bottom-${convertSpacingToTailwind(value)}`,
	left: (value) => `left-${convertSpacingToTailwind(value)}`,
	"z-index": (value) => `z-${value}`,
};

// Utility functions for conversion
function convertSpacingToTailwind(value) {
	if (value === "0") return "0";

	// Convert pixel values to Tailwind spacing
	const pixelMatch = value.match(/(\d+)px/);
	if (pixelMatch) {
		const pixels = parseInt(pixelMatch[1]);
		if (pixels === 4) return "1";
		if (pixels === 8) return "2";
		if (pixels === 12) return "3";
		if (pixels === 16) return "4";
		if (pixels === 20) return "5";
		if (pixels === 24) return "6";
		if (pixels === 32) return "8";
		if (pixels === 40) return "10";
		if (pixels === 48) return "12";
		if (pixels === 64) return "16";
		if (pixels === 80) return "20";
		if (pixels === 96) return "24";
		if (pixels === 128) return "32";
		if (pixels === 160) return "40";
		if (pixels === 192) return "48";
		if (pixels === 224) return "56";
		if (pixels === 256) return "64";
		if (pixels === 288) return "72";
		if (pixels === 320) return "80";
		if (pixels === 384) return "96";

		// For values not in the scale, suggest closest or use arbitrary value
		return `[${pixels}px]`;
	}

	// For rem values
	const remMatch = value.match(/(\d+(?:\.\d+)?)rem/);
	if (remMatch) {
		const rems = parseFloat(remMatch[1]);
		if (rems === 0.25) return "1";
		if (rems === 0.5) return "2";
		if (rems === 0.75) return "3";
		if (rems === 1) return "4";
		if (rems === 1.25) return "5";
		if (rems === 1.5) return "6";
		if (rems === 2) return "8";
		if (rems === 2.5) return "10";
		if (rems === 3) return "12";
		if (rems === 4) return "16";
		if (rems === 5) return "20";
		if (rems === 6) return "24";

		// For values not in the scale, suggest closest or use arbitrary value
		return `[${rems}rem]`;
	}

	// For percentage values
	if (value.endsWith("%")) {
		return `[${value}]`;
	}

	return value;
}

function convertSizeToTailwind(value, prefix) {
	if (value === "100%") return `${prefix}-full`;
	if (value === "50%") return `${prefix}-1/2`;
	if (value === "33.333%" || value === "33.3333%") return `${prefix}-1/3`;
	if (value === "66.666%" || value === "66.6666%") return `${prefix}-2/3`;
	if (value === "25%") return `${prefix}-1/4`;
	if (value === "75%") return `${prefix}-3/4`;
	if (value === "20%") return `${prefix}-1/5`;
	if (value === "40%") return `${prefix}-2/5`;
	if (value === "60%") return `${prefix}-3/5`;
	if (value === "80%") return `${prefix}-4/5`;

	if (value === "auto") return `${prefix}-auto`;

	// For pixel values
	const pixelMatch = value.match(/(\d+)px/);
	if (pixelMatch) {
		const pixels = parseInt(pixelMatch[1]);

		// Standard size mappings
		if (pixels === 0) return `${prefix}-0`;
		if (pixels === 1) return `${prefix}-px`;
		if (pixels === 4) return `${prefix}-1`;
		if (pixels === 8) return `${prefix}-2`;
		if (pixels === 12) return `${prefix}-3`;
		if (pixels === 16) return `${prefix}-4`;

		// For other values, use arbitrary values
		return `${prefix}-[${pixels}px]`;
	}

	return `${prefix}-[${value}]`;
}

function convertFontSizeToTailwind(value) {
	// For pixel values
	const pixelMatch = value.match(/(\d+)px/);
	if (pixelMatch) {
		const pixels = parseInt(pixelMatch[1]);
		if (pixels === 12) return "text-xs";
		if (pixels === 14) return "text-sm";
		if (pixels === 16) return "text-base";
		if (pixels === 18) return "text-lg";
		if (pixels === 20) return "text-xl";
		if (pixels === 24) return "text-2xl";
		if (pixels === 30) return "text-3xl";
		if (pixels === 36) return "text-4xl";
		if (pixels === 48) return "text-5xl";
		if (pixels === 60) return "text-6xl";

		// For other values
		return `text-[${pixels}px]`;
	}

	// For rem values
	const remMatch = value.match(/(\d+(?:\.\d+)?)rem/);
	if (remMatch) {
		const rems = parseFloat(remMatch[1]);
		if (rems === 0.75) return "text-xs";
		if (rems === 0.875) return "text-sm";
		if (rems === 1) return "text-base";
		if (rems === 1.125) return "text-lg";
		if (rems === 1.25) return "text-xl";
		if (rems === 1.5) return "text-2xl";
		if (rems === 1.875) return "text-3xl";
		if (rems === 2.25) return "text-4xl";
		if (rems === 3) return "text-5xl";
		if (rems === 3.75) return "text-6xl";

		// For other values
		return `text-[${rems}rem]`;
	}

	return `text-[${value}]`;
}

function convertFontWeightToTailwind(value) {
	if (value === "100") return "font-thin";
	if (value === "200") return "font-extralight";
	if (value === "300") return "font-light";
	if (value === "400" || value === "normal") return "font-normal";
	if (value === "500") return "font-medium";
	if (value === "600") return "font-semibold";
	if (value === "700" || value === "bold") return "font-bold";
	if (value === "800") return "font-extrabold";
	if (value === "900") return "font-black";

	return `font-[${value}]`;
}

function convertColorToTailwind(value, prefix = "text") {
	// Common color mappings
	if (value === "transparent") return `${prefix}-transparent`;
	if (value === "white" || value === "#fff" || value === "#ffffff")
		return `${prefix}-white`;
	if (value === "black" || value === "#000" || value === "#000000")
		return `${prefix}-black`;

	// For hex values
	const hexMatch = value.match(/#([0-9a-f]{3,8})/i);
	if (hexMatch) {
		return `${prefix}-[${value}]`;
	}

	// For rgb/rgba values
	if (value.startsWith("rgb")) {
		return `${prefix}-[${value}]`;
	}

	// For named colors, just pass through
	return `${prefix}-${value}`;
}

function convertBorderToTailwind(value) {
	// Match simple borders like "1px solid black"
	const match = value.match(/(\d+px)\s+(\w+)\s+(.+)/);
	if (match) {
		const width = match[1];
		const style = match[2];
		const color = match[3];

		let classes = [];

		// Width
		if (width === "1px") classes.push("border");
		else if (width === "2px") classes.push("border-2");
		else if (width === "4px") classes.push("border-4");
		else if (width === "8px") classes.push("border-8");
		else classes.push(`border-[${width}]`);

		// Style
		if (style !== "solid") classes.push(`border-${style}`);

		// Color
		if (color !== "black" && color !== "#000" && color !== "#000000") {
			classes.push(convertColorToTailwind(color, "border"));
		}

		return classes.join(" ");
	}

	return "border";
}

function convertBorderRadiusToTailwind(value) {
	if (value === "0") return "rounded-none";
	if (value === "2px") return "rounded-sm";
	if (value === "4px" || value === "0.25rem") return "rounded";
	if (value === "6px" || value === "0.375rem") return "rounded-md";
	if (value === "8px" || value === "0.5rem") return "rounded-lg";
	if (value === "12px" || value === "0.75rem") return "rounded-xl";
	if (value === "16px" || value === "1rem") return "rounded-2xl";
	if (value === "24px" || value === "1.5rem") return "rounded-3xl";
	if (value === "9999px" || value === "50%") return "rounded-full";

	return `rounded-[${value}]`;
}

function convertJustifyContentToTailwind(value) {
	if (value === "flex-start") return "justify-start";
	if (value === "flex-end") return "justify-end";
	if (value === "center") return "justify-center";
	if (value === "space-between") return "justify-between";
	if (value === "space-around") return "justify-around";
	if (value === "space-evenly") return "justify-evenly";

	return `justify-${value}`;
}

function convertAlignItemsToTailwind(value) {
	if (value === "flex-start") return "items-start";
	if (value === "flex-end") return "items-end";
	if (value === "center") return "items-center";
	if (value === "stretch") return "items-stretch";
	if (value === "baseline") return "items-baseline";

	return `items-${value}`;
}

// Parse inline style objects like { color: 'red', fontSize: '16px' }
function parseInlineStyle(styleString) {
	// Convert camelCase to kebab-case and parse the style object
	const parsedStyles = {};

	// Remove the outer braces and split by commas
	const cleanedString = styleString.replace(/^\{|\}$/g, "").trim();
	const stylePairs = cleanedString.split(",");

	stylePairs.forEach((pair) => {
		let [property, value] = pair.split(":").map((part) => part.trim());

		// Remove quotes from the value
		value = value.replace(/^['"]|['"]$/g, "");

		// Convert camelCase to kebab-case
		property = property.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

		parsedStyles[property] = value;
	});

	return parsedStyles;
}

// Convert inline style to Tailwind classes
function convertToTailwind(inlineStyle) {
	const parsedStyles = parseInlineStyle(inlineStyle);
	const tailwindClasses = [];

	for (const [property, value] of Object.entries(parsedStyles)) {
		if (cssToTailwindMap[property]) {
			const tailwindClass = cssToTailwindMap[property](value);
			tailwindClasses.push(tailwindClass);
		} else {
			// For properties we don't have mappings for
			tailwindClasses.push(`/* No mapping for ${property}: ${value} */`);
		}
	}

	return tailwindClasses.join(" ");
}

function processFile(filePath) {
	const content = fs.readFileSync(filePath, "utf8");

	// Find all inline styles
	const stylePattern = /style=\{(\{[^}]+\})\}/g;
	let match;
	const styles = [];

	while ((match = stylePattern.exec(content)) !== null) {
		styles.push({
			fullMatch: match[0],
			styleObject: match[1],
			startIndex: match.index,
			endIndex: match.index + match[0].length,
			lineInfo: getLineInfo(content, match.index),
		});
	}

	return styles;
}

function getLineInfo(content, index) {
	const lines = content.substring(0, index).split("\n");
	const lineNumber = lines.length;
	const column = lines[lines.length - 1].length + 1;
	const line = content.split("\n")[lineNumber - 1];

	return { lineNumber, column, line };
}

async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.question(
		"Enter the path to the file to analyze (relative to the frontend/web directory): ",
		async (filePath) => {
			const fullPath = path.join(__dirname, "..", filePath);

			try {
				if (!fs.existsSync(fullPath)) {
					console.error(`File not found: ${fullPath}`);
					rl.close();
					return;
				}

				const styles = processFile(fullPath);

				if (styles.length === 0) {
					console.log("No inline styles found in this file!");
					rl.close();
					return;
				}

				console.log(`Found ${styles.length} inline styles in ${filePath}:`);
				console.log("--------------------------------------------------");

				styles.forEach((style, index) => {
					console.log(`\n[${index + 1}] Line ${style.lineInfo.lineNumber}:`);
					console.log(`${style.lineInfo.line}`);
					console.log(`\nInline style: ${style.fullMatch}`);

					try {
						const tailwindClasses = convertToTailwind(style.styleObject);
						console.log(
							`\nSuggested Tailwind classes:\nclassName="${tailwindClasses}"`
						);
					} catch (error) {
						console.log(`\nError converting to Tailwind: ${error.message}`);
					}

					console.log("--------------------------------------------------");
				});

				rl.close();
			} catch (error) {
				console.error(`Error processing file: ${error.message}`);
				rl.close();
			}
		}
	);
}

main().catch(console.error);
