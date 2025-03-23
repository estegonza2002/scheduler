# CSS Audit Tools

This directory contains tools to help ensure we are following our CSS standards across the web application, specifically using only ShadCN components and Tailwind CSS.

## Available Tools

### 1. CSS Audit Script

This tool scans the entire codebase to find instances of non-compliant CSS usage, such as inline styles, custom CSS imports, or non-Tailwind class usage.

**Usage:**

```bash
# Run from the frontend/web directory
node scripts/css-audit.js
```

**Output:**

- Generates a detailed report (`css-audit-report.md`) with findings
- Lists all components not using ShadCN
- Identifies inline styles and non-Tailwind classes
- Provides recommendations for fixing issues

### 2. Inline Style Converter

This interactive tool helps convert React inline styles to equivalent Tailwind utility classes.

**Usage:**

```bash
# Run from the frontend/web directory
node scripts/convert-inline-styles.js
```

The tool will:

1. Prompt for a file path to analyze
2. Scan the file for inline styles
3. For each style found, suggest equivalent Tailwind classes

## Workflow for CSS Audit

1. **Generate Audit Report**

   ```bash
   node scripts/css-audit.js
   ```

2. **Review Report and Prioritize Issues**

   - Open `css-audit-report.md`
   - Focus on files with the most issues first
   - Create tickets in your project management system

3. **Convert Inline Styles**

   ```bash
   node scripts/convert-inline-styles.js
   ```

   - Input file paths for each component that needs fixing
   - Apply suggested Tailwind classes

4. **Verify Changes**

   - Run the app to visually verify changes
   - Check responsive behavior
   - Verify functionality

5. **Re-run Audit**
   - After fixes, run the audit again to verify progress
   - Track progress in the CSS_AUDIT_CHECKLIST.md file

## Common Tailwind Equivalents for Inline Styles

| CSS Property                   | Tailwind Class  |
| ------------------------------ | --------------- |
| padding: 16px                  | p-4             |
| margin: 8px                    | m-2             |
| width: 100%                    | w-full          |
| display: flex                  | flex            |
| align-items: center            | items-center    |
| justify-content: space-between | justify-between |
| font-weight: bold              | font-bold       |
| color: #fff                    | text-white      |
| background-color: #000         | bg-black        |
| border-radius: 4px             | rounded         |
| position: absolute             | absolute        |

## ShadCN Component Replacements

| Custom Component    | ShadCN Equivalent                        |
| ------------------- | ---------------------------------------- |
| Custom Button       | Button from "@/components/ui/button"     |
| Custom Modal/Dialog | Dialog from "@/components/ui/dialog"     |
| Custom Form Input   | Input from "@/components/ui/input"       |
| Custom Select       | Select from "@/components/ui/select"     |
| Custom Checkbox     | Checkbox from "@/components/ui/checkbox" |
| Custom Card         | Card from "@/components/ui/card"         |
| Custom Alert        | Alert from "@/components/ui/alert"       |
| Custom Table        | Table from "@/components/ui/table"       |
| Custom Tabs         | Tabs from "@/components/ui/tabs"         |

## Need Help?

If you're unsure about how to replace a component or convert a specific style, reference the ShadCN documentation or the Tailwind CSS documentation:

- [ShadCN UI Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
