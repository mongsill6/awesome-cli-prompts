# Compatibility Matrix

This document outlines shell, OS, and terminal emulator compatibility for `awesome-cli-prompts`.

## Shell Support Matrix

| Shell | Minimum Version | Linux | macOS | Windows (WSL2) | Windows (Git Bash) | Windows (PowerShell) | Notes |
|-------|-----------------|-------|-------|----------------|--------------------|----------------------|-------|
| Bash | 4.0 | Yes | Yes | Yes | Yes | No | POSIX-compliant, widely supported |
| Zsh | 5.0 | Yes | Yes | Yes | Partial | No | Enhanced prompt features, macOS default |
| Fish | 3.0 | Yes | Yes | Yes | No | No | Modern shell, non-POSIX |
| Starship | N/A (cross-shell) | Yes | Yes | Yes | Yes | Yes | Rust-based, all shells supported |

## Feature Compatibility

| Feature | Bash | Zsh | Fish | Starship |
|---------|------|-----|------|----------|
| Git Integration | Yes | Yes | Yes | Yes |
| Right Prompt | No | Yes | Yes | Yes |
| Async Rendering | No | Yes | Yes | Yes |
| Transient Prompt | No | Yes | Limited | Yes |
| Icon/Symbol Support | Yes | Yes | Yes | Yes |
| Nerd Font Icons | Yes | Yes | Yes | Yes |
| Color Support (256+) | Yes | Yes | Yes | Yes |
| Multi-line Prompt | Yes | Yes | Yes | Yes |
| Command Duration | Limited | Yes | Yes | Yes |
| Exit Status Display | Yes | Yes | Yes | Yes |

## OS Compatibility

### Linux
- **Supported Distributions**: Ubuntu, Debian, Fedora, CentOS, Alpine, Arch
- **Notes**: Most stable environment; all shells and features fully supported
- **Terminal Emulators**: GNOME Terminal, Konsole, Terminator, Alacritty, Kitty

### macOS
- **Minimum Version**: macOS 10.13 (High Sierra)
- **Default Shell**: Zsh (since macOS 10.15 Catalina)
- **Notes**: Full support; Intel and Apple Silicon (M1/M2/M3) compatible
- **Terminal Emulators**: Terminal.app, iTerm2, Alacritty, Kitty

### Windows

#### WSL2 (Recommended)
- **Supported Distributions**: Ubuntu, Debian, Fedora (in WSL2)
- **All Shells Supported**: Bash, Zsh, Fish, Starship all work as on native Linux
- **Notes**: Recommended for Windows users; full feature parity with Linux

#### Git Bash
- **Shell**: Bash 4.x compatible
- **Supported Shells**: Bash only
- **Limitations**: No Zsh or Fish support; right prompt and async features unavailable
- **Notes**: Minimal environment; suitable for basic Git operations

#### PowerShell
- **Minimum Version**: PowerShell 7.0+
- **Supported Shells**: Starship only (via pwsh module)
- **Notes**: Starship provides cross-shell compatibility; other themes not compatible

## Terminal Emulator Notes

### True Color Support

Most modern terminal emulators support 24-bit true color (16 million colors).

| Emulator | Linux | macOS | Windows | True Color | Nerd Font Support |
|----------|-------|-------|---------|------------|-------------------|
| GNOME Terminal | Yes | N/A | N/A | Yes | Yes |
| Konsole | Yes | N/A | N/A | Yes | Yes |
| Terminator | Yes | N/A | N/A | Yes | Yes |
| Alacritty | Yes | Yes | Yes | Yes | Yes |
| Kitty | Yes | Yes | Limited | Yes | Yes |
| iTerm2 | N/A | Yes | N/A | Yes | Yes |
| Terminal.app | N/A | Yes | N/A | Limited | Limited |
| Windows Terminal | N/A | N/A | Yes | Yes | Yes |

### Nerd Font Requirement

Themes using icons (all current themes) require a Nerd Font:

- **Installation**: Download from [nerdfonts.com](https://www.nerdfonts.com)
- **Recommended Fonts**: FiraCode Nerd Font, JetBrains Mono Nerd Font, Fira Mono Nerd Font
- **Terminal Configuration**: Set terminal font to Nerd Font variant
- **Fallback**: Without Nerd Fonts, icons display as placeholder characters

### Known Terminal Issues

| Terminal | Issue | Workaround |
|----------|-------|-----------|
| Terminal.app (macOS) | Limited true color support | Use iTerm2 or Alacritty instead |
| Git Bash | No async rendering | Acceptable performance with simple themes |
| Older versions of Konsole | Unicode rendering issues | Update Konsole to v21.04+ |
| PowerShell 5.1 | ANSI color codes not fully supported | Upgrade to PowerShell 7+ |

## Theme Compatibility

### Bash (13 Themes)

These themes are optimized for Bash and work best with Bash 4.0+:

1. **corporate-clean** - Minimal, professional appearance
2. **devops-k8s** - Kubernetes context display
3. **exit-code** - Shows last command exit status
4. **git-aware** - Extensive Git information
5. **git-focused** - Git-centric display
6. **hacker-matrix** - Matrix-style aesthetic
7. **lambda-minimal** - Single-line, function symbol
8. **minimal-clean** - Bare minimum information
9. **neon-glow** - Neon color palette
10. **pastel-dream** - Pastel colors
11. **powerline-noplug** - Powerline without plugins
12. **rainbow-pride** - Multi-color segments
13. **retro-green** - Vintage green terminal style

**Shell-Specific Notes**:
- Right prompt not available (use transient prompt alternative)
- Async rendering not available (immediate rendering only)
- All themes work on Bash 4.0+ without additional dependencies

### Zsh (10 Themes)

These themes leverage Zsh-specific features:

1. **async-git** - Asynchronous Git fetching
2. **cloud-devops** - Cloud service integrations
3. **docker-aware** - Docker container context
4. **k8s-context** - Kubernetes context display
5. **omz-compatible** - Oh-My-Zsh plugin compatibility
6. **p10k-lite** - Lightweight Powerlevel10k style
7. **pure-inspired** - Based on Pure theme design
8. **right-prompt** - Information in right margin
9. **transient-prompt** - Simplified history prompts
10. **two-line-time** - Two-line layout with timestamp

**Shell-Specific Notes**:
- Requires Zsh 5.0+
- Async features work seamlessly
- Right prompt support available
- Transient prompt available in Zsh 5.8+
- Recommended for macOS users (default shell)

### Fish (5 Themes)

Fish-specific implementations:

1. **corporate-fish** - Professional appearance
2. **fun-emoji** - Emoji-based indicators
3. **informative-fish** - Detailed status information
4. **minimal-fish** - Lightweight theme
5. **powerline-fish** - Powerline-style segments

**Shell-Specific Notes**:
- Requires Fish 3.0+
- Non-POSIX shell; unique syntax
- Good async support
- Right prompt available
- Syntax highlighting included

### Starship (5 Themes, YAML+TOML Config)

Starship provides cross-shell configuration:

1. **data-science** - Python, R, Jupyter environments
2. **devops** - Kubernetes, Docker, Terraform
3. **full-featured** - Complete feature set
4. **minimal** - Reduced visual output
5. **writer** - Markdown/writing environments

**Shell-Specific Notes**:
- Works with Bash, Zsh, Fish, PowerShell, Elvish
- Configuration: YAML format, auto-converted to TOML
- Performance: Fast Rust implementation
- Recommended for polyglots (multiple shells)

## Cross-Shell Compatibility

If you use multiple shells on the same machine:

| Use Case | Recommendation |
|----------|-----------------|
| Single shell only | Use shell-specific theme (Bash, Zsh, Fish) |
| Multiple shells | Use Starship (cross-shell) |
| Bash + Zsh | Either Starship or separate themes per shell |
| WSL2 + PowerShell | Use Starship for both |

## Installation by Shell

### Bash
```bash
# Source theme in ~/.bashrc
source /path/to/awesome-cli-prompts/themes/bash/theme-name.sh
```

### Zsh
```bash
# Source theme in ~/.zshrc
source /path/to/awesome-cli-prompts/themes/zsh/theme-name.zsh
```

### Fish
```bash
# Source theme in ~/.config/fish/config.fish
source /path/to/awesome-cli-prompts/themes/fish/theme-name.fish
```

### Starship
```bash
# Configure in ~/.config/starship.toml
config = '/path/to/awesome-cli-prompts/themes/starship/theme-name.toml'
```

## Known Limitations

### Bash-Specific
- No native right prompt support (use transient prompt as alternative)
- No async command execution in prompt
- Limited Unicode support on older systems (upgrade bash)
- Slower on large Git repositories due to synchronous checks

### Zsh-Specific
- Transient prompt requires Zsh 5.8+ (released 2021)
- Async features require `zsh/zpty` module (usually included)
- Some Oh-My-Zsh plugins may conflict with custom prompts

### Fish-Specific
- Non-standard shell syntax; scripts written for POSIX shells won't work
- Function syntax differs significantly from Bash/Zsh
- Limited integration with some Unix tools expecting Bash

### Starship-Specific
- Requires Rust installation (pre-built binaries available)
- First invocation slower due to initialization
- Some esoteric shell configurations not supported
- PowerShell module requires pwsh 7.0+

### Cross-OS
- **macOS**: Git on ARM (Apple Silicon) sometimes slower
- **Windows**: Slow filesystem on WSL1 (use WSL2)
- **Linux**: Some older distros lack modern terminal emulator support
- **All OS**: Without Nerd Fonts, icon-based themes degrade gracefully

## Testing Compatibility

To verify your setup:

```bash
# Check shell version
bash --version
zsh --version
fish --version

# Verify terminal true color support
echo -e "\e[38;2;255;0;0mRGB Red\e[0m"

# Check Nerd Font installation
# Display any special character; if visible, font is installed
echo ""

# Test theme
source /path/to/theme.sh  # or .zsh, .fish, .toml
```

## Support and Troubleshooting

For compatibility issues:

1. Verify shell and OS versions match requirements
2. Confirm terminal emulator supports true color (see table above)
3. Install Nerd Font if using icon-based themes
4. Check for conflicting shell configurations (`.bashrc`, `.zshrc`, etc.)
5. Test with minimal configuration (no other prompts or themes)

For detailed troubleshooting, refer to [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
