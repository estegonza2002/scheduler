declare module "jest-axe" {
	interface AxeResults {
		violations: Array<{
			id: string;
			impact: string;
			tags: string[];
			description: string;
			help: string;
			helpUrl: string;
			nodes: Array<{
				html: string;
				impact: string;
				target: string[];
				failureSummary: string;
			}>;
		}>;
	}

	export function axe(container: HTMLElement): Promise<AxeResults>;
	export function toHaveNoViolations(results: AxeResults): {
		message: () => string;
		pass: boolean;
	};
}

declare global {
	namespace jest {
		interface Matchers<R> {
			toHaveNoViolations(): R;
		}
	}
}
