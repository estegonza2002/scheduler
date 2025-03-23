import React from "react";

export const SampleInlineStyles = () => {
	return (
		<div
			style={{
				padding: "20px",
				backgroundColor: "#f5f5f5",
				borderRadius: "8px",
			}}>
			<h2
				style={{
					fontSize: "24px",
					fontWeight: "bold",
					color: "#333",
					marginBottom: "16px",
				}}>
				Sample Component with Inline Styles
			</h2>
			<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
				<div
					style={{
						padding: "12px",
						backgroundColor: "white",
						borderRadius: "4px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					}}>
					<h3 style={{ fontSize: "18px", color: "#555" }}>Item 1</h3>
					<p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
						This is an example of a component using inline styles that should be
						converted to Tailwind classes.
					</p>
				</div>
				<div
					style={{
						padding: "12px",
						backgroundColor: "white",
						borderRadius: "4px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
					}}>
					<h3 style={{ fontSize: "18px", color: "#555" }}>Item 2</h3>
					<p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
						Using the converter tool will help us identify the appropriate
						Tailwind classes to use instead.
					</p>
				</div>
			</div>
			<button
				style={{
					backgroundColor: "#3b82f6",
					color: "white",
					padding: "8px 16px",
					borderRadius: "4px",
					border: "none",
					marginTop: "16px",
					cursor: "pointer",
					fontWeight: "500",
				}}>
				Convert to Tailwind
			</button>
		</div>
	);
};
