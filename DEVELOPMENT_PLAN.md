# Development Plan — awesome-cli-prompts

## Vision
Transform from a static README into a full-stack CLI theme platform with installable presets, a CLI tool, and automated preview generation.

## 12-Phase Plan (20min intervals)

### Phase 1 — Project Scaffolding & Architecture
- Initialize npm package structure
- Set up project directories: `themes/`, `src/`, `scripts/`, `docs/`, `tests/`
- Create package.json with CLI entry point
- Add .gitignore, .editorconfig, .prettierrc
- Design theme YAML schema specification

### Phase 2 — Theme Schema & Parser
- Define YAML theme schema (name, shell, colors, segments, icons)
- Build theme parser (src/parser.js)
- Build theme validator (src/validator.js)
- Write unit tests for parser & validator
- Create 3 example themes in YAML format

### Phase 3 — Bash Theme Collection (10 themes)
- Minimal / Clean / Powerline / Git-focused / DevOps
- Lambda / Retro / Neon / Pastel / Corporate
- Each theme: YAML definition + raw bash snippet
- Test each theme's bash syntax validity

### Phase 4 — Zsh Theme Collection (10 themes)
- Pure-inspired / Oh-My-Zsh compatible / Powerlevel10k-style
- Async git / Two-line / Right-prompt / Transient
- Kubernetes context / Docker / Cloud provider aware
- Each with YAML + raw zsh snippet

### Phase 5 — Fish & Starship Themes (10 themes)
- Fish: 5 themes (minimal, powerline, informative, fun, corporate)
- Starship TOML: 5 presets (minimal, full, devops, data-science, writer)
- Cross-shell compatibility notes

### Phase 6 — CLI Installer Tool (Core)
- `src/cli.js` — main CLI entry with commander.js
- `install` command: detect shell, backup existing config, apply theme
- `list` command: show available themes with categories
- `preview` command: render theme preview in terminal
- `uninstall` command: restore backup

### Phase 7 — CLI Installer Tool (Advanced)
- `search` command with fuzzy matching
- `info` command: show theme details
- Interactive mode with inquirer.js prompts
- Shell auto-detection (bash/zsh/fish)
- Config merging (don't overwrite entire rc file)

### Phase 8 — Theme Preview Generator
- Build SVG terminal renderer (scripts/generate-preview.js)
- Auto-generate preview images for each theme
- Output to `previews/` directory
- Create gallery README with all previews
- Add preview to theme YAML metadata

### Phase 9 — Documentation & Website
- Comprehensive docs/ directory
- CONTRIBUTING.md with theme submission guide
- Theme creation tutorial
- Shell compatibility matrix
- FAQ and troubleshooting guide

### Phase 10 — Testing & Quality
- Unit tests for all src/ modules (Jest)
- Integration tests: install/uninstall cycle
- Theme syntax validation tests (all 30 themes)
- Linting: ESLint + Prettier
- Code coverage setup

### Phase 11 — CI/CD & Automation
- GitHub Actions: test on push/PR
- GitHub Actions: auto-generate previews on theme changes
- GitHub Actions: npm publish on release tag
- Dependabot configuration
- Release workflow with changelog generation

### Phase 12 — Polish & Launch
- README.md complete rewrite with GIF demos
- Add badges (npm, CI, coverage, license)
- npm publish (v1.0.0)
- Create GitHub release
- Add repo topics and social preview image
