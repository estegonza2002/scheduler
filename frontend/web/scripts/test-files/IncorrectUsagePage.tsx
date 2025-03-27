import React from "react";
import { PageHeader } from "../../src/components/ui/page-header";

export default function IncorrectUsagePage() {
	return (
		<div>
			<PageHeader
				description="This page uses PageHeader incorrectly"
				// Missing required title prop
			/>
			<p>The PageHeader is missing the required title prop</p>
			<div>
				<button>Action</button>
			</div>
		</div>
	);
}
