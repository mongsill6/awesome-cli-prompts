# Troubleshooting Guide for awesome-cli-prompts

This guide helps you diagnose and resolve common issues with `awesome-cli-prompts` (alias: `acp`).

## Theme Not Applied After Install

### Problem: Theme changes don't appear after installation

**Cause:** The shell hasn't reloaded the updated configuration file.

**Solution:**

1. Manually source your shell config file:
   ```bash
   # For Bash
   source ~/.bashrc

   # For Zsh
   source ~/.zshrc

   # For Fish
   source ~/.config/fish/config.fish
   ```

2. Or restart your terminal completely (close and reopen).

3. Verify the theme was installed:
   ```bash
   acp list
   ```

4. Check if your shell is using the correct config file:
   ```bash
   echo $SHELL
   ```

### Problem: Wrong shell detected during installation

**Cause:** The tool detected a different shell than the one you're using.

**Solution:**

1. Check your current shell:
   ```bash
   echo $SHELL
   ps -p $$
   ```

2. Verify which shell is your login shell:
   ```bash
   chsh -l  # List available shells
   chsh -s /bin/bash  # Set Bash as default (or /bin/zsh, /usr/bin/fish, etc.)
   ```

3. Re-run installation after confirming your shell:
   ```bash
   acp install <theme>
   ```

### Problem: Configuration file not found or not modified

**Cause:** The tool can't locate your shell config file.

**Solution:**

1. Check if your config file exists:
   ```bash
   # Bash
   ls -la ~/.bashrc

   # Zsh
   ls -la ~/.zshrc

   # Fish
   ls -la ~/.config/fish/config.fish

   # Starship
   ls -la ~/.config/starship.toml
   ```

2. If the file doesn't exist, create it:
   ```bash
   # Bash
   touch ~/.bashrc

   # Zsh
   touch ~/.zshrc

   # Fish
   mkdir -p ~/.config/fish && touch ~/.config/fish/config.fish
   ```

3. Re-run installation:
   ```bash
   acp install <theme>
   ```

## Colors/Characters Not Displaying Correctly

### Problem: Colors appear as escape codes or wrong colors display

**Cause:** Terminal doesn't support true color (24-bit color).

**Solution:**

1. Test if your terminal supports true color:
   ```bash
   echo -e "\033[38;2;255;100;0mTrueColor\033[0m"
   ```
   If you see orange text, true color is supported. If you see garbled output, it's not.

2. Enable true color support:
   ```bash
   # Add to ~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish
   export COLORTERM=truecolor
   ```

3. Source your config:
   ```bash
   source ~/.bashrc  # or ~/.zshrc, ~/.config/fish/config.fish
   ```

4. Update your terminal emulator:
   - iTerm2 (macOS): Enable "256 color" in Preferences > Profiles > Terminal
   - GNOME Terminal: Usually supports true color by default
   - Windows Terminal: Supports true color by default
   - VS Code: Native terminal supports true color

### Problem: Special characters appear as boxes or gibberish

**Cause:** Terminal is missing a compatible Nerd Font or Powerline font.

**Solution:**

1. Install a Nerd Font:
   - Download from https://www.nerdfonts.com/
   - Recommended fonts: FiraCode Nerd Font, JetBrains Mono Nerd Font, Inconsolata Nerd Font

2. Apply the font in your terminal:
   - macOS (iTerm2): Preferences > Profiles > Text > Font
   - macOS (Terminal.app): Preferences > Profiles > Font
   - GNOME Terminal: Preferences > Profiles > Text Appearance
   - Windows Terminal: Settings > Profiles > Appearance > Font face
   - VS Code: `"terminal.integrated.fontFamily": "FiraCode Nerd Font"`

3. Restart your terminal and re-source your config:
   ```bash
   source ~/.bashrc  # or equivalent
   ```

### Problem: Colors/characters work locally but not over SSH or in tmux

**Cause:** TERM variable is not set correctly in the remote environment.

**Solution:**

1. Check your current TERM:
   ```bash
   echo $TERM
   ```

2. Set TERM explicitly in your config:
   ```bash
   # For SSH sessions, add to ~/.bashrc or ~/.zshrc
   export TERM=xterm-256color
   ```

3. For tmux, add to ~/.tmux.conf:
   ```
   set -g default-terminal "screen-256color"
   ```

4. For SSH, ensure your local TERM is passed correctly:
   ```bash
   # SSH will pass your local TERM. Verify on remote:
   ssh user@host "echo $TERM"
   ```

5. As a last resort, use truecolor explicitly:
   ```bash
   export COLORTERM=truecolor
   ```

## Git Segments Not Working

### Problem: Git information not showing in prompt

**Cause:** Git is not installed or not in your PATH.

**Solution:**

1. Verify git is installed and in PATH:
   ```bash
   which git
   git --version
   ```

2. If not installed:
   ```bash
   # macOS
   brew install git

   # Ubuntu/Debian
   sudo apt-get install git

   # Fedora/RHEL
   sudo dnf install git
   ```

3. If git is installed but not found, add it to PATH:
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export PATH="/usr/local/bin:$PATH"
   source ~/.bashrc  # or ~/.zshrc
   ```

### Problem: Git segments show but are always empty

**Cause:** Not in a git repository.

**Solution:**

1. Verify you're in a git repo:
   ```bash
   git status
   ```

2. Initialize a git repo if needed:
   ```bash
   git init
   ```

3. Check the git config is readable:
   ```bash
   cat .git/config
   ```

### Problem: Git segments are slow or causing lag

**Cause:** Repository is large or git is running expensive operations.

**Solution:**

1. Check for performance issues:
   ```bash
   time git status
   ```

2. Optimize git performance in large repos:
   ```bash
   # Enable git core.preloadindex
   git config --global core.preloadindex true

   # Use git worktreeConfig if applicable
   git config --global feature.worktreeConfig true
   ```

3. Configure git to skip untracked files in status:
   ```bash
   git config --local status.showUntrackedFiles no
   ```

4. For very large repos, consider disabling git segments:
   ```bash
   acp install <theme> --no-git
   ```

## Restore Original Prompt

### Problem: Want to revert to the original shell prompt

**Solution 1: Use the uninstall command**

```bash
acp uninstall
```

This removes the theme and restores your original prompt.

**Solution 2: Manually restore from backup**

The tool creates automatic backups before modifying your config files:

```bash
# List available backups
ls -la ~/.bashrc.acp-backup
ls -la ~/.zshrc.acp-backup
ls -la ~/.config/fish/config.fish.acp-backup
ls -la ~/.config/starship.toml.acp-backup

# Restore a backup
cp ~/.bashrc.acp-backup ~/.bashrc
cp ~/.zshrc.acp-backup ~/.zshrc
cp ~/.config/fish/config.fish.acp-backup ~/.config/fish/config.fish
cp ~/.config/starship.toml.acp-backup ~/.config/starship.toml

# Source the restored config
source ~/.bashrc  # or equivalent for your shell
```

**Solution 3: Check git history**

If you're using git for your dotfiles:

```bash
git log --oneline -- ~/.bashrc
git show <commit>:~/.bashrc > ~/.bashrc
```

## Installation Issues

### Problem: Node.js version is too old

**Cause:** The tool requires Node.js 12+ (or newer).

**Solution:**

1. Check your Node.js version:
   ```bash
   node --version
   ```

2. Update Node.js:
   ```bash
   # Using nvm (recommended)
   nvm install node
   nvm use node

   # Using Homebrew (macOS)
   brew upgrade node

   # Using apt (Ubuntu/Debian)
   sudo apt-get install nodejs

   # Using official installer
   # Visit https://nodejs.org/
   ```

3. Verify the update:
   ```bash
   node --version
   ```

4. Re-install awesome-cli-prompts:
   ```bash
   npm install -g awesome-cli-prompts
   ```

### Problem: Permission errors during npm global install

**Cause:** npm lacks write permissions for global packages.

**Solution 1: Fix npm permissions**

```bash
# Create .npm-global directory
mkdir ~/.npm-global

# Configure npm to use it
npm config set prefix '~/.npm-global'

# Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Re-install
npm install -g awesome-cli-prompts
```

**Solution 2: Use sudo (not recommended)**

```bash
sudo npm install -g awesome-cli-prompts
```

**Solution 3: Use nvm (recommended)**

If you're using nvm, npm should have correct permissions automatically:

```bash
nvm use node
npm install -g awesome-cli-prompts
```

### Problem: npx cache issues

**Cause:** Cached version conflicts with installed version.

**Solution:**

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Clear npx cache:
   ```bash
   npm cache clean --force
   npx clear-npx-cache  # if this command exists
   ```

3. Reinstall:
   ```bash
   npm install -g awesome-cli-prompts@latest
   ```

4. Verify installation:
   ```bash
   acp --version
   which acp
   ```

## Shell-Specific Issues

### Bash Issues

**Problem: PS1 is being overridden**

**Cause:** Another tool is modifying PS1 after awesome-cli-prompts.

**Solution:**

1. Check what's modifying PS1:
   ```bash
   cat ~/.bashrc | grep -n "PS1"
   ```

2. Identify conflicting tools (conda, pyenv, rbenv, etc.)

3. Reorder your config so awesome-cli-prompts loads last:
   ```bash
   # At the end of ~/.bashrc

   # awesome-cli-prompts initialization
   eval "$(acp init bash)"

   # Other tools should go BEFORE this
   ```

4. Source and test:
   ```bash
   source ~/.bashrc
   ```

### Zsh Issues

**Problem: Conflicts with Oh-My-Zsh or Powerlevel10k**

**Cause:** Multiple prompt frameworks competing for control.

**Solution:**

1. If using Oh-My-Zsh, check your theme:
   ```bash
   grep "^ZSH_THEME" ~/.zshrc
   ```

2. Set ZSH_THEME to 'random' or a minimal theme:
   ```bash
   # Edit ~/.zshrc
   ZSH_THEME="minimal"
   ```

3. If using Powerlevel10k, you may need to uninstall it first:
   ```bash
   rm -rf ~/.powerlevel10k
   ```

4. Make sure awesome-cli-prompts loads at the end of ~/.zshrc:
   ```bash
   # Add at the very end of ~/.zshrc
   eval "$(acp init zsh)"
   ```

5. Reload:
   ```bash
   source ~/.zshrc
   ```

### Fish Issues

**Problem: Function conflicts or command not found**

**Cause:** Fish function namespace collision or config errors.

**Solution:**

1. Check for conflicting functions:
   ```bash
   functions | grep prompt
   ```

2. Check Fish syntax:
   ```bash
   fish -n  # Checks syntax without executing
   ```

3. Check that the config file is valid:
   ```bash
   cat ~/.config/fish/config.fish | tail -20
   ```

4. Clear Fish cache:
   ```bash
   rm -rf ~/.cache/fish
   ```

5. Reload Fish:
   ```bash
   exec fish
   ```

### Starship Issues

**Problem: Existing starship.toml conflicts with installation**

**Cause:** Your custom starship.toml has incompatible settings.

**Solution:**

1. Backup your current starship.toml:
   ```bash
   cp ~/.config/starship.toml ~/.config/starship.toml.backup
   ```

2. Check what's in your current config:
   ```bash
   cat ~/.config/starship.toml
   ```

3. Compare with awesome-cli-prompts default:
   ```bash
   acp info <theme>  # Shows theme details including starship config
   ```

4. Merge manually if needed:
   ```bash
   # Keep your custom settings, add awesome-cli-prompts modules
   nano ~/.config/starship.toml
   ```

5. Validate the syntax:
   ```bash
   starship config
   ```

6. Reload:
   ```bash
   starship module prompt  # Test prompt rendering
   ```

## Getting Help

### Debugging Information

Gather debugging information before reporting an issue:

```bash
# Show system and tool info
acp info

# Show theme details
acp info <theme-name>

# Show your shell config
echo "SHELL: $SHELL"
echo "TERM: $TERM"
echo "COLORTERM: $COLORTERM"

# Show git status
which git
git --version
git status 2>&1 | head -5

# Show Node.js info
node --version
npm --version
```

### Report Issues

Visit the GitHub repository to report issues:

```
https://github.com/awesome-cli-prompts/awesome-cli-prompts/issues
```

Include:
- Output of `acp info`
- Your shell (Bash/Zsh/Fish/Starship)
- Terminal emulator and version
- Steps to reproduce the issue
- Expected vs. actual behavior

### Common Commands

```bash
# List installed themes
acp list

# Show theme details and debugging info
acp info <theme>

# Reinstall a theme
acp uninstall && acp install <theme>

# Check theme compatibility
acp check <theme>

# View installation logs
acp logs

# Reset to defaults
acp reset
```
