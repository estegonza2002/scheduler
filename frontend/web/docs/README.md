# Documentation

This directory contains documentation for our application. The documentation is organized into the following sections:

## Directory Structure

- **[guides/](./guides/)** - User guides and how-to documents for developers

  - Contains step-by-step instructions and explanations for common tasks
  - Examples: testing-guide.md, context-providers-migration.md, stripe-integration.md

- **[reference/](./reference/)** - Technical reference documentation

  - Contains detailed API documentation and technical specifications
  - Examples: data-providers.md, organization-management.md

- **[migrations/](./migrations/)** - Migration guides for major changes

  - Contains detailed guides for migrating between different versions or implementations
  - Examples: card-component-migration.md

- **[schema/](./schema/)** - Database schema documentation

  - Contains information about database tables, fields, and relationships
  - Examples: organization-schema.md, locations-table.md, table-standardization.md

- **[design-system/](./design-system/)** - Design system documentation
  - Contains guidelines, component specifications, and usage examples
  - Organized into components/ and guidelines/ subdirectories

## Naming Convention

Files in this directory follow these naming conventions:

- All filenames are lowercase with hyphens separating words
- No spaces or underscores in filenames
- Descriptive names that indicate the content
- `.md` extension for all documentation files

Examples:

- `data-providers.md` (not `DATA_PROVIDERS.md` or `dataproviders.md`)
- `context-providers-migration.md` (not `MIGRATION_GUIDE.md` or `context-migration.md`)

## Contributing

When adding new documentation:

1. Place it in the appropriate subdirectory based on its type
2. Follow the naming convention described above
3. Include a clear title at the top of the document
4. Structure documents with headings, lists, and code examples
5. Keep content up-to-date with the codebase

## Legacy Files

Some older documentation files may not follow these conventions yet. We're in the process of reorganizing and standardizing all documentation.
