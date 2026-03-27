# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-03-27

### Added

- **33 curated CLI prompt themes** across 4 shell environments
  - 13 Bash themes (git-aware, minimal, powerline, devops, corporate, hacker, neon, pastel, retro, rainbow, lambda, exit-code, git-focused)
  - 10 Zsh themes (pure-inspired, p10k-lite, async-git, transient, two-line, right-prompt, cloud-devops, docker-aware, k8s-context, omz-compatible)
  - 5 Fish themes (minimal, powerline, informative, fun-emoji, corporate)
  - 5 Starship themes (minimal, full-featured, devops, data-science, writer)
- CLI installer tool (`npx awesome-cli-prompts` or `acp`)
  - `install` command to install themes
  - `uninstall` command to remove themes
  - `list` command to display available themes
  - `search` command to find themes
  - `preview` command to view theme previews
  - `info` command to display detailed theme information
  - `interactive` command for interactive theme selection
- Shell auto-detection functionality
- Theme validation and parsing engine
- SVG preview generator
- Comprehensive documentation
  - Installation guide
  - Guide for creating custom themes
  - Shell compatibility matrix
  - FAQ section
  - Troubleshooting guide
- CI/CD pipeline with GitHub Actions
- Unit and integration tests with Jest
- Code quality tools (ESLint, Prettier)
- Development and contribution guidelines

