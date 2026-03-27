# FAQ - awesome-cli-prompts

## General

### Q: What is awesome-cli-prompts?

Awesome-cli-prompts (acp) is a lightweight CLI tool for managing shell prompt themes across Bash, Zsh, Fish, and Starship. It provides a curated collection of themed prompts with easy installation, preview, and management capabilities.

### Q: How is this different from oh-my-zsh or Starship?

Oh-my-zsh is a Zsh-specific framework with broader features like plugins and auto-updates. Starship is a language-agnostic prompt built in Rust. Awesome-cli-prompts is shell-agnostic, focuses specifically on prompt themes, and offers a simpler, faster installation process with zero framework dependencies.

### Q: Is awesome-cli-prompts free?

Yes, awesome-cli-prompts is completely free and open-source. All themes are available under permissive licenses.

### Q: What shells does awesome-cli-prompts support?

The tool supports Bash, Zsh, Fish, and Starship. Each theme is customized for the shell's specific syntax and capabilities.

### Q: Can I use multiple shells with the same theme?

Yes, if a theme is available for multiple shells. You can install the same theme for different shells independently. Use the `info` command to check which shells a theme supports.

## Installation

### Q: How do I install awesome-cli-prompts?

Install via npm:
```bash
npm install -g awesome-cli-prompts
```

Then use the `acp` command to list and install themes:
```bash
acp list
acp install <theme-name>
```

### Q: Does awesome-cli-prompts work on Windows?

Yes, it works on Windows with supported shells (Bash via Git Bash, WSL, or MSYS2; PowerShell with Fish/Zsh via WSL). Native Windows PowerShell is not currently supported. For the best experience, use WSL2 with your preferred shell.

### Q: Do I need Node.js installed?

Yes, Node.js (v14 or higher) is required since awesome-cli-prompts is distributed via npm. You can check your version with `node --version`.

### Q: Can I use npx instead of installing globally?

Yes, you can use npx to run commands without installing:
```bash
npx awesome-cli-prompts list
npx awesome-cli-prompts install <theme-name>
```

This approach works well for occasional use but is slower than a global installation.

### Q: What happens to my current shell configuration during installation?

The install command creates a backup of your shell configuration file (e.g., `.bashrc`, `.zshrc`, `.config/fish/config.fish`) before making changes. If something goes wrong, you can restore the backup or uninstall the theme.

## Themes

### Q: How many themes are available?

The number of themes varies and grows over time. Use `acp list` to see the current theme collection for your shell. You can also view themes at the official repository.

### Q: Can I create my own theme?

Yes. Create a YAML file in the `themes/{shell}/` directory following the naming convention `my-theme.yaml`. The theme should define prompt segments (PS1, colors, git integration, etc.) for your target shell. Refer to existing themes as templates and test using `acp preview my-theme`.

### Q: How do I preview a theme before installing?

Use the preview command to see how a theme looks:
```bash
acp preview <theme-name>
```

This displays the prompt in a sample shell session without modifying your configuration. For interactive exploration, use:
```bash
acp interactive
```

### Q: How do I switch between installed themes?

Install a new theme with `acp install <theme-name>`. The new theme will override the previous one in your shell configuration. To revert, uninstall the current theme:
```bash
acp uninstall <theme-name>
```

Then install a different theme.

### Q: Where are themes stored?

Themes are stored in the `themes/{shell}/` directory within the awesome-cli-prompts package installation. For global installs, this is typically:
```
/usr/local/lib/node_modules/awesome-cli-prompts/themes/
```

For local installs, check your project's `node_modules/` directory. User-created themes can be added to this location or referenced by absolute path.

### Q: How do I search for themes?

Use the search command to find themes by name or keyword:
```bash
acp search <keyword>
```

Get detailed information about a theme with:
```bash
acp info <theme-name>
```

## Troubleshooting

### Q: The theme installed but my prompt didn't change. What do I do?

First, restart your shell or reload your configuration:
```bash
source ~/.bashrc    # for Bash
source ~/.zshrc     # for Zsh
source ~/.config/fish/config.fish  # for Fish
```

If the prompt still doesn't appear, verify the theme is compatible with your shell using `acp info <theme-name>`. Check your shell configuration file for syntax errors.

### Q: Colors look wrong or are displaying incorrectly.

This usually indicates a terminal color scheme or TERM variable mismatch. Verify your terminal supports 256-color or truecolor mode. Set your TERM variable correctly:
```bash
export TERM=xterm-256color  # or screen-256color, xterm-truecolor, etc.
```

Then reload your shell. Check the theme documentation for specific color requirements.

### Q: How do I restore my original shell prompt?

Uninstall the current theme:
```bash
acp uninstall <theme-name>
```

If you need to manually restore, check the backup file created during installation (typically `~/.bashrc.backup` or similar) and restore it:
```bash
mv ~/.bashrc.backup ~/.bashrc
```

### Q: Git segments are not showing in my prompt.

Verify Git is installed and in your PATH:
```bash
git --version
```

Ensure the theme supports git integration using `acp info <theme-name>`. Some themes require additional dependencies (e.g., git-status scripts). Check the theme's documentation for setup instructions.

### Q: My shell freezes or runs slowly with a theme.

This may indicate a slow git status check or expensive shell operations. Try disabling git integration if the theme supports it, or switch to a lighter theme. Run `acp list` and look for themes marked as "minimal" or "fast".

## Contributing

### Q: How do I contribute a theme?

Fork the awesome-cli-prompts repository and create a new theme YAML file in `themes/{shell}/`. Follow the naming convention `my-theme.yaml` and the YAML schema defined in the repository documentation. Test your theme locally:
```bash
acp preview my-theme
```

Create a pull request with a clear description of your theme, its features, and compatible shells.

### Q: What's the review process for new themes?

Pull requests are reviewed for code quality, shell compatibility, and adherence to the theme schema. The maintainers verify that the theme works across supported shells and doesn't conflict with existing themes. Allow 1-2 weeks for review. Feedback will be provided inline if changes are needed.

### Q: Can I port themes from other tools like oh-my-zsh or Starship?

Yes, but ensure you have permission (check the original theme's license). Convert the theme's configuration to awesome-cli-prompts' YAML schema, test thoroughly, and credit the original author in your pull request. Verify the ported theme works identically in the target shell.

### Q: How do I report a bug or request a feature?

Open an issue on the GitHub repository with a clear title and description. For bugs, include your shell, OS, and the output of `acp info <theme-name>`. For feature requests, explain the use case and why it benefits the project.

### Q: Can I maintain a separate theme collection?

Yes, awesome-cli-prompts is modular. You can fork the repository and maintain your own theme collection. Alternatively, specify a custom themes directory by modifying your configuration or contributing to a community fork.
