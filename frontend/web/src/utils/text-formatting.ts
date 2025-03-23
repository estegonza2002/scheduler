import React from "react";

// Helper functions for text formatting
// Originally from ShiftDetailsPage.tsx

// Function for simple markdown parsing
export const parseSimpleMarkdown = (text: string) => {
	if (!text) return "";

	// Replace bold: **text** or __text__ with <strong>text</strong>
	let formatted = text.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");

	// Replace italics: *text* or _text_ with <em>text</em>
	formatted = formatted.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

	// Replace ordered lists: "1. item" with ordered list items
	formatted = formatted.replace(/^\d+\.\s(.*)$/gm, "<li>$1</li>");

	// Replace bullets: "- item" with list items
	formatted = formatted.replace(/^- (.*)$/gm, "<li>$1</li>");

	// Wrap consecutive list items in a ul or ol based on the first item
	formatted = formatted.replace(
		/<li>.*?<\/li>(?:\s*<li>.*?<\/li>)+/g,
		(match) => {
			// Check if the first item was from an ordered list (would have started with a number)
			if (text.match(/^\d+\.\s/)) {
				return `<ol class="list-decimal pl-6 my-2">${match}</ol>`;
			}
			return `<ul class="list-disc pl-6 my-2">${match}</ul>`;
		}
	);

	// Add line breaks for newlines
	formatted = formatted.replace(/\n/g, "<br>");

	return formatted;
};

// Function to help with text formatting in textareas
export const formatSelectedText = (
	textarea: HTMLTextAreaElement | null,
	type: "bold" | "italic" | "list" | "ordered-list"
) => {
	if (!textarea) return;

	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const selectedText = textarea.value.substring(start, end);
	let replacement = "";
	let cursorOffset = 0;

	if (selectedText) {
		// Text is selected
		switch (type) {
			case "bold":
				replacement = `**${selectedText}**`;
				cursorOffset = 2;
				break;
			case "italic":
				replacement = `*${selectedText}*`;
				cursorOffset = 1;
				break;
			case "list":
				// Split by line and add bullet to each line
				replacement = selectedText
					.split("\n")
					.map((line) => (line.trim() ? `- ${line}` : line))
					.join("\n");
				cursorOffset = 2;
				break;
			case "ordered-list":
				// Split by line and add numbers to each line
				replacement = selectedText
					.split("\n")
					.map((line, index) => (line.trim() ? `${index + 1}. ${line}` : line))
					.join("\n");
				cursorOffset = 3;
				break;
		}

		const newValue =
			textarea.value.substring(0, start) +
			replacement +
			textarea.value.substring(end);

		return {
			value: newValue,
			selectionStart: start + replacement.length,
			selectionEnd: start + replacement.length,
		};
	} else {
		// No text selected, insert placeholder
		switch (type) {
			case "bold":
				replacement = "**Bold text**";
				cursorOffset = 2;
				break;
			case "italic":
				replacement = "*Italic text*";
				cursorOffset = 1;
				break;
			case "list":
				replacement = "- List item";
				cursorOffset = 2;
				break;
			case "ordered-list":
				replacement = "1. Ordered item";
				cursorOffset = 3;
				break;
		}

		const newValue =
			textarea.value.substring(0, start) +
			replacement +
			textarea.value.substring(end);

		return {
			value: newValue,
			selectionStart: start + replacement.length - cursorOffset,
			selectionEnd: start + replacement.length - cursorOffset,
		};
	}
};

// Add function to parse mentions and create links
export const parseMentions = (text: string) => {
	if (!text) return text;
	return text;
};

// Render task description (placeholder for mention handling)
export const renderTaskDescription = (description: string) => {
	return React.createElement("span", {}, description);
};
