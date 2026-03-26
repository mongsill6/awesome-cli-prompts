# Contributing to awesome-cli-prompts

Thanks for your interest in contributing! Here's how to add your own theme.

## Adding a New Theme

1. Fork and clone the repo
2. Create a YAML file in the appropriate `themes/{shell}/` directory
3. Follow the schema defined in `docs/THEME_SCHEMA.md`
4. Run `npm run validate` to ensure your theme is valid
5. Add a preview screenshot (optional but encouraged)
6. Submit a PR

## Theme Naming Convention

- File name: `{theme-id}.yaml` (kebab-case)
- Theme ID must be unique across all shells
- Keep names descriptive but concise

## Code Contributions

1. Fork and clone
2. `npm install`
3. Create a feature branch
4. Write tests for new functionality
5. Run `npm test` and ensure all tests pass
6. Submit a PR

## Style Guide

- JavaScript: Follow `.eslintrc.json` and `.prettierrc`
- YAML themes: Follow the schema spec
- Commits: Use conventional commits (feat:, fix:, docs:, etc.)

## Code of Conduct

Be kind, be respectful, and help make everyone's terminal beautiful.
