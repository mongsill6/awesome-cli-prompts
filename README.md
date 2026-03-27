```
 █████╗ ██╗    ██╗███████╗███████╗ ██████╗ ███╗   ███╗███████╗
██╔══██╗██║    ██║██╔════╝██╔════╝██╔═══██╗████╗ ████║██╔════╝
███████║██║ █╗ ██║█████╗  ███████╗██║   ██║██╔████╔██║█████╗
██╔══██║██║███╗██║██╔══╝  ╚════██║██║   ██║██║╚██╔╝██║██╔══╝
██║  ██║╚███╔███╔╝███████╗███████║╚██████╔╝██║ ╚═╝ ██║███████╗
╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝

 ██████╗██╗     ██╗    ██████╗ ██████╗  ██████╗ ███╗   ███╗██████╗ ████████╗███████╗
██╔════╝██║     ██║    ██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝██╔════╝
██║     ██║     ██║    ██████╔╝██████╔╝██║   ██║██╔████╔██║██████╔╝   ██║   ███████╗
██║     ██║     ██║    ██╔═══╝ ██╔══██╗██║   ██║██║╚██╔╝██║██╔═══╝    ██║   ╚════██║
╚██████╗███████╗██║    ██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║        ██║   ███████║
 ╚═════╝╚══════╝╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝        ╚═╝   ╚══════╝
```

<div align="center">

[![npm version](https://img.shields.io/npm/v/awesome-cli-prompts)](https://www.npmjs.com/package/awesome-cli-prompts)
[![CI](https://img.shields.io/github/actions/workflow/status/mongsill6/awesome-cli-prompts/ci.yml?branch=main)](https://github.com/mongsill6/awesome-cli-prompts/actions)
[![License: MIT](https://img.shields.io/github/license/mongsill6/awesome-cli-prompts)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**A curated collection of 33 beautiful CLI prompt themes for Bash, Zsh, Fish, and Starship — with a one-command installer.**

</div>

---

## Quick Start

No installation required. Just run:

```bash
npx awesome-cli-prompts
```

Or install globally:

```bash
npm install -g awesome-cli-prompts
```

Then use either command:

```bash
awesome-cli-prompts
# or the short alias:
acp
```

---

## Features

- **33 hand-crafted themes** across 4 shells — something for every style
- **4 shells supported** — Bash, Zsh, Fish, and Starship (cross-shell)
- **One-command install** — interactive installer applies the theme directly to your shell config
- **Live preview** — see what a theme looks like before installing
- **Fuzzy search** — find the perfect theme by name or keyword
- **Shell auto-detect** — automatically detects your current shell and filters relevant themes
- **Safe installs** — backs up your existing config before making changes
- **Easy uninstall** — cleanly remove any installed theme at any time

---

## Theme Gallery

### Bash (13 themes)

| Theme | Description |
|-------|-------------|
| `corporate-clean` | Polished, minimal prompt suited for professional environments |
| `devops-k8s` | Shows Kubernetes context and namespace inline |
| `exit-code` | Displays exit code in red when the last command fails |
| `git-aware` | Branch name and dirty indicator with color coding |
| `git-focused` | Detailed git status: staged, unstaged, and untracked counts |
| `hacker-matrix` | Green-on-black retro aesthetic with bold symbols |
| `lambda-minimal` | Ultra-minimal lambda symbol prompt, zero noise |
| `minimal-clean` | Clean directory + arrow, nothing else |
| `neon-glow` | Vibrant cyan and magenta for dark terminal lovers |
| `pastel-dream` | Soft pastel colors, easy on the eyes during long sessions |
| `powerline-noplug` | Powerline-style segments without any plugin dependencies |
| `rainbow-pride` | Colorful gradient prompt that cycles through the spectrum |
| `retro-green` | Classic phosphor-green terminal nostalgia |

### Zsh (10 themes)

| Theme | Description |
|-------|-------------|
| `async-git` | Non-blocking git status via async prompt update |
| `cloud-devops` | AWS/GCP profile and region displayed in the prompt |
| `docker-aware` | Shows active Docker context name |
| `k8s-context` | Kubernetes context and namespace at a glance |
| `omz-compatible` | Drop-in compatible with Oh My Zsh plugin ecosystem |
| `p10k-lite` | Powerlevel10k-inspired layout without the full framework |
| `pure-inspired` | Clean two-line prompt inspired by the Pure theme |
| `right-prompt` | Puts git/time info in RPROMPT to keep the left side minimal |
| `transient-prompt` | Previous prompts collapse to a single character after execution |
| `two-line-time` | Timestamp on the first line, input on the second |

### Fish (5 themes)

| Theme | Description |
|-------|-------------|
| `corporate-fish` | Clean, neutral prompt for work environments |
| `fun-emoji` | Status and context conveyed through expressive emoji |
| `informative-fish` | Verbose prompt: git, exit code, duration, virtualenv |
| `minimal-fish` | Bare-minimum Fish prompt for distraction-free focus |
| `powerline-fish` | Powerline-style segments native to Fish syntax |

### Starship (5 themes)

| Theme | Description |
|-------|-------------|
| `data-science` | Python env, conda, Jupyter context — built for data work |
| `devops` | Git, Docker, Kubernetes, Terraform context in one line |
| `full-featured` | All modules enabled: language versions, cloud, git, time |
| `minimal` | Directory and prompt character only — maximum clarity |
| `writer` | Distraction-free prompt for prose and note-taking workflows |

---

## Installation

### Using npx (no install needed)

```bash
npx awesome-cli-prompts
```

### Global install via npm

```bash
npm install -g awesome-cli-prompts
```

### Global install via npx (one-time)

```bash
npx --yes awesome-cli-prompts install
```

---

## Usage

### Interactive mode (recommended)

```bash
acp
```

Launches the interactive TUI: browse, preview, and install themes with arrow keys.

### Install a specific theme

```bash
acp install git-aware            # auto-detects your shell
acp install p10k-lite --shell zsh
acp install minimal --shell starship
```

### List available themes

```bash
acp list                         # all themes
acp list --shell bash            # filter by shell
```

### Search themes

```bash
acp search git                   # fuzzy search by keyword
acp search "minimal"
```

### Preview a theme

```bash
acp preview neon-glow
acp preview devops --shell zsh
```

### Uninstall a theme

```bash
acp uninstall git-aware
```

### Show theme info

```bash
acp info powerline-noplug
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Detailed installation guide for each shell |
| [docs/GALLERY.md](docs/GALLERY.md) | Visual gallery with screenshots of every theme |
| [docs/CREATING_THEMES.md](docs/CREATING_THEMES.md) | How to create and submit your own theme |
| [docs/THEME_SCHEMA.md](docs/THEME_SCHEMA.md) | Theme file format and metadata specification |
| [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) | Shell version compatibility matrix |
| [docs/FAQ.md](docs/FAQ.md) | Frequently asked questions |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and how to fix them |

---

## Contributing

Contributions are welcome! Whether it's a new theme, a bug fix, or a documentation improvement — please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
