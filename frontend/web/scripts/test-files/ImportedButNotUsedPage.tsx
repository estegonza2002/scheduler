import React from "react";
import { PageHeader } from "../../src/components/ui/page-header";

export default function ImportedButNotUsedPage() {
	return (
		<div>
			<h1>This page imports PageHeader</h1>
			<p>But it doesn't actually use it</p>
			<div>
				<button>Action</button>
			</div>
		</div>
	);
}
