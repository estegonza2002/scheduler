import React from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export const ProperTailwindShadCN = () => {
	return (
		<Card className="p-5 bg-gray-50 rounded-lg">
			<CardHeader className="px-0 pt-0">
				<CardTitle className="text-2xl font-bold text-gray-800 mb-4">
					Properly Styled Component
				</CardTitle>
			</CardHeader>
			<CardContent className="px-0 pb-0 space-y-3">
				<div className="flex flex-col gap-3">
					<Card className="p-3 bg-white rounded shadow-sm">
						<h3 className="text-lg text-gray-700">Item 1</h3>
						<p className="text-sm text-gray-600 mt-2">
							This is an example of a component using ShadCN components and
							Tailwind classes.
						</p>
					</Card>
					<Card className="p-3 bg-white rounded shadow-sm">
						<h3 className="text-lg text-gray-700">Item 2</h3>
						<p className="text-sm text-gray-600 mt-2">
							Using ShadCN components with Tailwind classes results in
							consistent, maintainable UI.
						</p>
					</Card>
				</div>
				<Button
					className="mt-4"
					variant="default">
					ShadCN Button
				</Button>
			</CardContent>
		</Card>
	);
};
