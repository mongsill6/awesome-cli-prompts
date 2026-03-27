# Installation Guide

Welcome to `awesome-cli-prompts` (alias: `acp`). This guide covers all installation methods.

## Quick Start

The fastest way to get started without installing anything globally:

```bash
npx awesome-cli-prompts
```

This downloads and runs the latest version directly from npm. Perfect for trying it out or occasional use.

## Global Install

Install globally to use the `acp` command anywhere on your system:

```bash
npm install -g awesome-cli-prompts
```

After installation, you can run:

```bash
acp
```

Or use the full package name:

```bash
awesome-cli-prompts
```

## Install from Source

To install directly from the GitHub repository:

```bash
git clone https://github.com/yourusername/awesome-cli-prompts.git
cd awesome-cli-prompts
npm install
npm link
```

The `npm link` command creates a symlink in your global node_modules, making `acp` available system-wide.

## Requirements

Before installing, ensure your system meets these requirements:

- **Node.js** version 16.0.0 or higher
- **npm** version 7.0.0 or higher
- **Supported Shells**:
  - Bash 4.0+
  - Zsh 5.0+
  - Fish 3.0+
  - Starship 1.0+

Check your versions:

```bash
node --version
npm --version
bash --version
```

## Verify Installation

After installation, verify everything is working correctly:

```bash
acp --version
```

This displays the installed version number.

List available prompts:

```bash
acp list
```

This confirms the CLI is properly configured and can access prompt data.

## Updating

### For Global Installs

Update to the latest version:

```bash
npm update -g awesome-cli-prompts
```

Or reinstall the latest:

```bash
npm install -g awesome-cli-prompts@latest
```

### For Source Installs

Update your local clone and reinstall:

```bash
cd /path/to/awesome-cli-prompts
git pull origin main
npm install
npm link
```

## Uninstalling

### Global Install

Remove the global installation:

```bash
npm uninstall -g awesome-cli-prompts
```

### Source Install

Remove the symlink:

```bash
npm unlink awesome-cli-prompts
```

Or remove it globally from your npm directory:

```bash
npm uninstall -g awesome-cli-prompts
```

Then delete the cloned repository:

```bash
rm -rf /path/to/awesome-cli-prompts
```

## Troubleshooting

### Command not found

If `acp` is not found after global install, ensure npm's global bin directory is in your PATH:

```bash
echo $PATH
npm config get prefix
```

For macOS/Linux, add to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
export PATH="$(npm config get prefix)/bin:$PATH"
```

### Permission denied

If you encounter permission errors during global install, either:

1. Use `sudo` (not recommended):
   ```bash
   sudo npm install -g awesome-cli-prompts
   ```

2. Fix npm permissions (recommended):
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   ```

### Wrong Node.js version

If you have multiple Node.js versions installed, ensure the correct one is active:

```bash
node --version
```

Consider using a version manager like [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm).

## Next Steps

After successful installation, check out the [Usage Guide](./USAGE.md) to learn how to use awesome-cli-prompts.
