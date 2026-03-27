# Creating Themes for awesome-cli-prompts

This guide walks you through creating custom shell prompt themes for awesome-cli-prompts. Whether you're building a minimal bash theme or a feature-rich Starship configuration, you'll find the tools and best practices here.

## Overview

Themes define the visual appearance and behavior of shell prompts. In awesome-cli-prompts, themes are declarative YAML (or TOML for Starship) files that describe:

- **Segments**: the visual building blocks of your prompt (username, git branch, exit code, etc.)
- **Styling**: colors, bold/italic text, and spacing
- **Layout**: prompt orientation (left-to-right), separators, and newlines
- **Shell-specific behavior**: how the theme adapts to bash, zsh, fish, or Starship

Themes are language-agnostic—the same theme definition renders correctly across different shells via the awesome-cli-prompts rendering engine.

## Theme File Structure

Each theme is a single YAML file (or TOML for Starship) stored in:

```
themes/
├── bash/
│   ├── minimal-dark.yaml
│   └── powerline-git.yaml
├── zsh/
│   ├── minimal-dark.yaml
│   └── powerline-git.yaml
├── fish/
│   └── minimal-dark.yaml
└── starship/
    └── minimal-dark.toml
```

The filename must be lowercase with hyphens (e.g., `my-theme-name.yaml`), and the theme can be referenced by its basename (without extension).

## YAML Schema Reference

Here's the complete structure of a theme file:

```yaml
name: "Display Name"                    # Required: human-readable name
description: "Short description"        # Required: one-liner explaining the theme
author: "Your Name"                     # Required: theme creator
version: "1.0.0"                        # Required: semantic versioning
shell: bash                             # Required: bash, zsh, fish, or starship
tags: [minimal, git, powerline, dark]   # Required: categorization tags
colors:                                 # Optional: named color palette
  primary: "\033[38;5;39m"
  secondary: "\033[38;5;208m"
  accent: "\033[38;5;46m"
  error: "\033[38;5;196m"
segments:                               # Required: array of prompt segments
  - type: username
    style:
      fg: "primary"
      bg: ""
      bold: true
    condition: "root"                   # Optional: show only for root
separator: " "                          # Separator between segments
prompt_char: "❯"                        # Character before user input
newline: false                          # Add newline before prompt_char
right_prompt:                           # Optional: right-aligned segments (zsh/fish)
  separator: " "
  segments:
    - type: time
      style:
        fg: "secondary"
```

## Step-by-Step Tutorial: Creating Your First Theme

Let's build a simple, clean bash theme called "minimal-cool".

### Step 1: Create the File

Create `themes/bash/minimal-cool.yaml`:

```yaml
name: "Minimal Cool"
description: "Clean bash prompt with git status and exit codes"
author: "Jane Developer"
version: "1.0.0"
shell: bash
tags: [minimal, git, simple]
colors:
  success: "\033[38;5;46m"    # Green
  warning: "\033[38;5;226m"   # Yellow
  error: "\033[38;5;196m"     # Red
  info: "\033[38;5;39m"       # Blue
  reset: "\033[0m"
segments:
  - type: username
    style:
      fg: "info"
      bold: true
  - type: hostname
    style:
      fg: "info"
  - type: cwd
    style:
      fg: "success"
  - type: git_branch
    style:
      fg: "warning"
  - type: exit_code
    style:
      fg: "error"
      bold: true
    condition: "!0"            # Only show if exit code is not 0
separator: " → "
prompt_char: "❯"
newline: false
```

### Step 2: Understand What You Created

Breaking down the theme:

- **Colors section**: Defines a palette of ANSI color codes. You reference these by name in segment styling (e.g., `fg: "info"`).
- **Segments**: The left prompt will display username → hostname → cwd → git_branch → exit_code (when non-zero), each separated by " → ".
- **prompt_char**: The `❯` character appears before user input.
- **newline**: false means everything stays on one line.

### Step 3: Test the Theme

```bash
acp preview minimal-cool
```

This renders your theme in the current directory, showing what it looks like with actual values.

### Step 4: Iterate and Refine

You can adjust colors, add/remove segments, or change the separator. Re-run `acp preview` after each change.

## Segment Types

Segments are the building blocks of your prompt. Here are all available types:

### username

Displays the current user (e.g., `jane`).

```yaml
- type: username
  style:
    fg: "primary"
    bold: true
```

Condition example: `condition: "root"` shows this segment only when you're logged in as root.

### hostname

Displays the machine hostname (e.g., `macbook-pro`).

```yaml
- type: hostname
  style:
    fg: "secondary"
```

Useful for systems where you ssh frequently—helps you remember which machine you're on.

### cwd

Displays the current working directory. Can show full path or truncated path.

```yaml
- type: cwd
  style:
    fg: "primary"
  options:
    max_depth: 3                # Show last 3 path components
    truncate_symbol: "…"        # Character for truncation
```

### git_branch

Shows the current git branch name (if in a git repository).

```yaml
- type: git_branch
  style:
    fg: "warning"
    bold: false
  condition: "git"              # Only show if in a git repo
```

### git_status

Shows git status indicators (modified, untracked, ahead/behind).

```yaml
- type: git_status
  style:
    fg: "error"
  options:
    dirty_symbol: "●"           # Symbol for dirty repo
    untracked_symbol: "?"
    ahead_symbol: "⬆"
    behind_symbol: "⬇"
```

### exit_code

Shows the exit code of the last command (typically only when non-zero).

```yaml
- type: exit_code
  style:
    fg: "error"
    bold: true
  condition: "!0"               # Only show if exit code != 0
```

### time

Displays the current time.

```yaml
- type: time
  style:
    fg: "secondary"
  options:
    format: "%H:%M:%S"          # 24-hour format; use %I:%M %p for 12-hour
```

### custom

Renders arbitrary text. Useful for fixed symbols or spacing.

```yaml
- type: custom
  style:
    fg: "primary"
  content: "❮"                  # Fixed text to display
```

## Colors and Styling

### ANSI Color Codes

awesome-cli-prompts supports standard ANSI escape sequences. Define them in the `colors` section:

```yaml
colors:
  # 8-color palette (basic)
  black: "\033[30m"
  red: "\033[31m"
  green: "\033[32m"
  yellow: "\033[33m"
  blue: "\033[34m"
  magenta: "\033[35m"
  cyan: "\033[36m"
  white: "\033[37m"

  # 256-color palette (extended)
  primary: "\033[38;5;39m"      # Foreground color index 39
  bg_dark: "\033[48;5;235m"     # Background color index 235

  # RGB (24-bit truecolor) — if your terminal supports it
  accent: "\033[38;2;255;102;178m"   # Foreground RGB
  bg_light: "\033[48;2;240;240;240m" # Background RGB
```

Refer to this reference for color indices:
- **0-7**: Standard colors (black through white)
- **8-15**: Bright variants
- **16-231**: 216-color cube (216 additional colors)
- **232-255**: Grayscale (24 shades from dark to light)

### Styling Options

In the `style` object for any segment:

```yaml
style:
  fg: "primary"                 # Foreground color (by name or ANSI code)
  bg: ""                        # Background color (optional)
  bold: true                    # Bold text
  italic: false                 # Italic text
  underline: false              # Underline text
  dim: false                    # Dim/faint text
```

### Example: Multi-Color Palette

```yaml
colors:
  reset: "\033[0m"
  bold: "\033[1m"

  # Status colors
  ok: "\033[38;5;46m"           # Green
  warn: "\033[38;5;226m"         # Yellow
  fail: "\033[38;5;196m"         # Red
  info: "\033[38;5;39m"          # Blue

  # Background
  bg_dark: "\033[48;5;235m"
  bg_light: "\033[48;5;245m"
```

## Shell-Specific Notes

### Bash and Zsh

Bash and Zsh themes use similar syntax but with minor behavioral differences:

- **Bash**: Prompt is rebuilt every time the shell displays it. Use `\033` escape sequences.
- **Zsh**: Supports prompt expansion codes (e.g., `%n` for username). awesome-cli-prompts translates YAML into both formats.

Example theme works for both:

```yaml
shell: bash  # or zsh; both use the same YAML structure
segments:
  - type: username
    style:
      fg: "primary"
```

### Fish

Fish uses a different syntax internally, but the YAML structure remains the same. awesome-cli-prompts generates the appropriate Fish function.

Key Fish-specific considerations:

- Colors in Fish use names or hex codes; awesome-cli-prompts handles the translation.
- Fish supports more complex functions; for advanced behavior, you may need to post-process the generated prompt function.

### Starship

Starship is a cross-shell prompt engine with its own TOML configuration format. awesome-cli-prompts can render Starship-compatible themes.

**Starship themes use TOML, not YAML:**

Create `themes/starship/minimal-cool.toml`:

```toml
format = "$username$hostname$directory$git_branch$git_status$status$line_break$character"
add_newline = false

[username]
show_always = true
format = "[$user]($style)"
style_user = "bold blue"

[hostname]
ssh_only = false
format = "[@$hostname]($style) "
style = "bold blue"

[directory]
truncation_length = 3
truncate_to_repo = true
format = "[$path]($style) "
style = "bold green"

[git_branch]
format = "[on $symbol$branch]($style) "
style = "bold yellow"

[git_status]
format = "([$all_status$ahead_behind]($style) )?"
style = "bold red"

[status]
disabled = false
format = "[$symbol]($style) "
style = "bold red"
symbol = "✖"

[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"
```

**Converting YAML to TOML:**

If you have a YAML theme, Starship requires conversion:
- Module names become TOML sections (e.g., `git_branch` → `[git_branch]`)
- Segment options map to Starship module options
- Colors use Starship's color names or hex codes

## Testing Your Theme

### Using acp preview

The quickest way to preview your theme:

```bash
acp preview minimal-cool
```

This renders your prompt in the current directory with actual values.

### Manual Testing in Your Shell

For bash/zsh, source the generated prompt function:

```bash
source /path/to/awesome-cli-prompts/themes/bash/minimal-cool.yaml
```

Then reload your shell:

```bash
exec bash
```

Your prompt should update immediately.

### Testing Edge Cases

Create test scenarios to validate your theme:

1. **In a git repository with uncommitted changes:**
   ```bash
   cd ~/my-repo
   echo "test" > file.txt
   acp preview minimal-cool
   ```
   Verify git_status shows dirty indicator.

2. **After a failed command:**
   ```bash
   false
   acp preview minimal-cool
   ```
   Verify exit_code segment appears (if condition is `!0`).

3. **As root:**
   ```bash
   sudo bash
   acp preview minimal-cool
   ```
   Verify username segment styling differs if you have a `condition: "root"` rule.

4. **Deep directory nesting:**
   ```bash
   cd /very/deep/nested/directory/structure
   acp preview minimal-cool
   ```
   Verify cwd truncation works correctly.

## Advanced: Custom Segments and Conditions

### Using Conditions

Conditions control when a segment displays. Common patterns:

```yaml
# Show only if in a git repository
condition: "git"

# Show only if exit code is non-zero
condition: "!0"

# Show only if user is root
condition: "root"

# Show only in SSH session
condition: "ssh"

# Show only if a file exists in the current directory
condition: "file:.env"
```

### Custom Segment Example

Combine custom segments with conditions to build complex prompts:

```yaml
segments:
  - type: username
    style:
      fg: "primary"
      bold: true
  - type: custom
    style:
      fg: "primary"
    content: "@"
    condition: "!root"          # Hide @ when user is root
  - type: hostname
    style:
      fg: "primary"
    condition: "ssh"            # Show hostname only over SSH
  - type: cwd
    style:
      fg: "success"
  - type: git_branch
    condition: "git"
    style:
      fg: "warning"
  - type: custom
    style:
      fg: "error"
    content: " [dirty]"
    condition: "git_dirty"      # Show [dirty] if git repo has uncommitted changes
```

## Contributing Your Theme

### Submission Checklist

Before submitting a pull request, ensure your theme meets these requirements:

1. **File naming**: Use lowercase with hyphens (e.g., `my-awesome-theme.yaml`)
2. **Required fields**: All theme files must include:
   - `name`: Human-readable display name
   - `description`: One-line summary
   - `author`: Your name or GitHub username
   - `version`: Starting with "1.0.0"
   - `shell`: One of bash, zsh, fish, starship
   - `tags`: At least 2 tags for categorization
   - `segments`: At least one segment
   - `prompt_char`: The character before user input
3. **YAML validity**: Run `yamllint` to check for syntax errors
4. **Testing**: Run `acp preview <theme-id>` and verify it renders correctly
5. **Documentation**: Add a comment block at the top of your theme file:

```yaml
# Minimal Cool Theme
# A clean, git-aware prompt with status indicators.
#
# Features:
#   - Git branch and status
#   - Exit code highlighting
#   - Minimal color palette
#
# Author: Jane Developer
# License: MIT (or your chosen license)

name: "Minimal Cool"
# ... rest of theme
```

### Directory Organization

Place your theme in the appropriate shell directory:

- **Bash**: `themes/bash/my-theme.yaml`
- **Zsh**: `themes/zsh/my-theme.yaml`
- **Fish**: `themes/fish/my-theme.yaml`
- **Starship**: `themes/starship/my-theme.toml`

If your theme works across multiple shells, submit copies to each directory.

### Naming Conventions

Theme names should be:

- **Descriptive**: `powerline-git`, `minimal-dark`, not `theme1` or `awesome`
- **Lowercase with hyphens**: `my-custom-theme`, not `MyCustomTheme`
- **Unique**: Check existing themes before choosing a name

### PR Guidelines

When submitting a pull request:

1. Create a topic branch: `git checkout -b themes/minimal-cool`
2. Add your theme file(s) to the appropriate `themes/` directory
3. Include a brief description in the PR body:
   ```
   ## Theme Submission: Minimal Cool

   A clean bash prompt theme featuring:
   - Git branch and status
   - Exit code highlighting
   - Minimal, professional appearance

   Tested on: bash 5.1, macOS 12.x
   ```
4. Ensure CI passes (YAML validation, syntax checks)
5. Wait for maintainer review and feedback

## Resources

- **ANSI Color Reference**: https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
- **256-Color Palette**: https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit_256-color
- **Starship Documentation**: https://starship.rs/config/
- **Shell Prompt Customization**: https://www.gnu.org/software/bash/manual/html_node/Controlling-the-Prompt.html

## Troubleshooting

### Theme won't preview

- Check for YAML syntax errors: `yamllint themes/bash/my-theme.yaml`
- Verify all required fields are present
- Ensure color names in segments match defined colors

### Colors look wrong in the terminal

- Your terminal may not support 256 colors. Use basic ANSI codes (0-7) instead of indexed colors.
- Check terminal color support: `echo $TERM` should be `xterm-256color` or similar
- Try RGB (24-bit) colors if your terminal supports them

### Segments not appearing

- Check segment `type` spelling (must match available types exactly)
- Verify `condition` syntax and logic
- Ensure required segment options are provided

### Shell not applying the theme

- Reload your shell after installation: `exec bash` (or your shell)
- Check that the generated prompt file is in your shell's rc file (`.bashrc`, `.zshrc`, etc.)
- Verify no other prompt customization is overriding it
