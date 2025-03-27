import React from "react";
import { PageHeader } from "../../components/ui/page-header";

/**
 * Test component to verify enforce-content-container ESLint rule
 * This should trigger warnings since it doesn't use ContentContainer
 */
export default function ContentContainerTestPage() {
	return (
		<div>
			<PageHeader title="Content Container Test" />

			{/* This should trigger a warning since content is not wrapped in ContentContainer */}
			<div className="p-4">
				<h2>Test Content</h2>
				<p>
					This content should be wrapped in a ContentContainer according to our
					design system guidelines.
				</p>
			</div>
		</div>
	);
}
