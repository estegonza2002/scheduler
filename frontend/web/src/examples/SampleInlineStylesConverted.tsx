import React from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

// BEFORE: Inline styles
// <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
//   <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>
//     Sample Component with Inline Styles
//   </h2>
//   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//     <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
//       <h3 style={{ fontSize: '18px', color: '#555' }}>Item 1</h3>
//       <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
//         This is an example of a component using inline styles that should be converted to Tailwind classes.
//       </p>
//     </div>
//     <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
//       <h3 style={{ fontSize: '18px', color: '#555' }}>Item 2</h3>
//       <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
//         Using the converter tool will help us identify the appropriate Tailwind classes to use instead.
//       </p>
//     </div>
//   </div>
//   <button
//     style={{
//       backgroundColor: '#3b82f6',
//       color: 'white',
//       padding: '8px 16px',
//       borderRadius: '4px',
//       border: 'none',
//       marginTop: '16px',
//       cursor: 'pointer',
//       fontWeight: '500'
//     }}
//   >
//     Convert to Tailwind
//   </button>
// </div>

// AFTER: Converted to Tailwind and ShadCN
export const SampleInlineStylesConverted = () => {
	return (
		<Card className="p-5 bg-gray-100 rounded-lg">
			<CardHeader className="px-0 pt-0">
				<CardTitle className="text-2xl font-bold text-gray-800 mb-4">
					Sample Component with Tailwind
				</CardTitle>
			</CardHeader>
			<CardContent className="px-0 pb-0">
				<div className="flex flex-col gap-3">
					<Card className="p-3 bg-white rounded shadow-sm">
						<h3 className="text-lg text-gray-700">Item 1</h3>
						<p className="text-sm text-gray-600 mt-2">
							This is an example of a component using inline styles that should
							be converted to Tailwind classes.
						</p>
					</Card>
					<Card className="p-3 bg-white rounded shadow-sm">
						<h3 className="text-lg text-gray-700">Item 2</h3>
						<p className="text-sm text-gray-600 mt-2">
							Using the converter tool will help us identify the appropriate
							Tailwind classes to use instead.
						</p>
					</Card>
				</div>
				<Button
					className="mt-4"
					variant="default">
					Convert to Tailwind
				</Button>
			</CardContent>
		</Card>
	);
};
