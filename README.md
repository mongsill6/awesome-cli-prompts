# Awesome CLI Prompts ✨

A curated collection of beautiful and functional CLI prompt (PS1/PS2) configurations for Bash, Zsh, Fish, and more.

> Make your terminal not just functional, but *beautiful*.

## Table of Contents

- [Why Customize Your Prompt?](#why-customize-your-prompt)
- [Bash Prompts](#bash-prompts)
- [Zsh Prompts](#zsh-prompts)
- [Fish Prompts](#fish-prompts)
- [Starship (Cross-Shell)](#starship-cross-shell)
- [Contributing](#contributing)
- [License](#license)

---

## Why Customize Your Prompt?

Your terminal prompt is the interface you interact with hundreds of times a day. A well-designed prompt can:

- Show **git branch & status** at a glance
- Display **exit codes** when commands fail
- Indicate **Python virtualenvs**, Node versions, or cloud contexts
- Use **color** to visually separate information
- Keep you oriented with **shortened paths**

---

## Bash Prompts

### Minimal Clean

```bash
# ~/.bashrc
PS1='\[\e[38;5;39m\]\W\[\e[0m\] \[\e[38;5;208m\]❯\[\e[0m\] '
```

Result: `projects ❯`

### Git-Aware

```bash
# Shows branch name and dirty status
parse_git_branch() {
  git branch 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

parse_git_dirty() {
  [[ $(git status --porcelain 2>/dev/null) ]] && echo "*"
}

PS1='\[\e[1;34m\]\w\[\e[33m\]$(parse_git_branch)\[\e[31m\]$(parse_git_dirty)\[\e[0m\] \$ '
```

Result: `~/projects/myapp (main)* $`

### Powerline Style (No Plugin)

```bash
PS1='\[\e[48;5;236;38;5;231m\] \u \[\e[48;5;31;38;5;236m\]\[\e[48;5;31;38;5;231m\] \w \[\e[0;38;5;31m\]\[\e[0m\] '
```

### Exit Code Indicator

```bash
prompt_cmd() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    PS1="\[\e[31m\][$exit_code]\[\e[0m\] \w \$ "
  else
    PS1="\[\e[32m\]✓\[\e[0m\] \w \$ "
  fi
}
PROMPT_COMMAND=prompt_cmd
```

---

## Zsh Prompts

### Pure-Inspired Minimal

```zsh
# ~/.zshrc
autoload -Uz vcs_info
precmd() { vcs_info }
zstyle ':vcs_info:git:*' formats ' %F{yellow}(%b)%f'

PROMPT='%F{cyan}%~%f${vcs_info_msg_0_}
%F{magenta}❯%f '
```

### Two-Line with Time

```zsh
PROMPT='%F{240}%*%f %F{blue}%~%f ${vcs_info_msg_0_}
%(?:%F{green}:%F{red})λ%f '
```

### Right-Side Prompt

```zsh
RPROMPT='%F{240}%n@%m%f'
PROMPT='%F{cyan}%~%f %F{magenta}❯%f '
```

---

## Fish Prompts

### Clean and Colorful

```fish
# ~/.config/fish/functions/fish_prompt.fish
function fish_prompt
    set -l last_status $status
    set -l cwd (basename (prompt_pwd))

    if test $last_status -ne 0
        set_color red
        echo -n "[$last_status] "
    end

    set_color cyan
    echo -n "$cwd"

    # Git branch
    set -l branch (git branch --show-current 2>/dev/null)
    if test -n "$branch"
        set_color yellow
        echo -n " ($branch)"
    end

    set_color magenta
    echo -n " ❯ "
    set_color normal
end
```

---

## Starship (Cross-Shell)

[Starship](https://starship.rs) works with Bash, Zsh, Fish, PowerShell, and more.

### Install

```bash
curl -sS https://starship.rs/install.sh | sh
```

### Minimal Config

```toml
# ~/.config/starship.toml

format = """
$directory\
$git_branch\
$git_status\
$character"""

[directory]
truncation_length = 3
style = "bold cyan"

[git_branch]
format = "[$branch]($style) "
style = "bold yellow"

[git_status]
format = '([$all_status$ahead_behind]($style) )'
style = "bold red"

[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"
```

### Nerd Font Config (Icons)

```toml
# ~/.config/starship.toml

[directory]
read_only = " 󰌾"

[git_branch]
symbol = " "
format = "[$symbol$branch]($style) "

[nodejs]
symbol = " "

[python]
symbol = " "

[rust]
symbol = "🦀 "

[docker_context]
symbol = " "
```

---

## Color Reference

| Code | Color |
|------|-------|
| `\e[31m` | Red |
| `\e[32m` | Green |
| `\e[33m` | Yellow |
| `\e[34m` | Blue |
| `\e[35m` | Magenta |
| `\e[36m` | Cyan |
| `\e[0m` | Reset |

For 256 colors: `\e[38;5;{N}m` (foreground) or `\e[48;5;{N}m` (background), where N = 0-255.

---

## Contributing

1. Fork this repo
2. Add your prompt config in the appropriate section
3. Include a preview of what it looks like
4. Submit a PR!

## License

[MIT](LICENSE)
