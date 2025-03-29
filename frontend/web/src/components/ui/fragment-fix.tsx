import * as React from "react";

/**
 * A wrapper for React.Fragment that ensures correct prop usage
 * This fixes issues with invalid type prop errors
 */
export function FragmentFix({
	children,
	key,
}: {
	children: React.ReactNode;
	key?: string | number;
}) {
	return <>{children}</>;
}
