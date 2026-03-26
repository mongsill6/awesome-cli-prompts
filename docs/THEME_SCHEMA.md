# Theme YAML Schema

## Overview
Each theme is defined as a YAML file in the `themes/{shell}/` directory.

## Schema

```yaml
name: string          # Theme display name (required)
id: string            # Unique identifier, kebab-case (required)
shell: string         # Target shell: bash | zsh | fish | starship (required)
author: string        # Author name or GitHub handle (required)
description: string   # Short description (required)
version: string       # Semver (required)
tags: string[]        # Categories: minimal, powerline, git, devops, fun, etc.
requires:             # Optional dependencies
  nerd_font: boolean  # Requires Nerd Font?
  tools: string[]     # External tools needed (e.g., git, kubectl)

colors:               # Color scheme metadata
  primary: string     # Primary accent color (hex or name)
  secondary: string   # Secondary color
  background: string  # Suggested terminal background

segments:             # What info the prompt displays
  - type: string      # directory | git_branch | git_status | exit_code | time | user | host | virtualenv | node | k8s | docker | custom
    style: string     # Color/style specification
    position: string  # left | right (if shell supports it)

prompt:               # The actual prompt code
  code: |             # Multi-line shell code to source
    ...
  install_instructions: string  # Any extra setup steps
```

## Example

See `themes/bash/minimal-clean.yaml` for a reference implementation.

## Validation

Run `npm run validate` to check all themes against this schema.
