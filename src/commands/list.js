const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { parseThemeFile } = require('../parser');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const THEMES_DIR = path.join(PROJECT_ROOT, 'themes');
const SHELL_CATEGORIES = ['bash', 'zsh', 'fish', 'starship'];

async function list(options = {}) {
  try {
    const themesByShell = {};
    let totalCount = 0;

    const categories = options.shell
      ? [options.shell]
      : SHELL_CATEGORIES;

    for (const shell of categories) {
      const shellDir = path.join(THEMES_DIR, shell);

      if (!fs.existsSync(shellDir)) {
        continue;
      }

      const files = fs.readdirSync(shellDir).filter(f => f.endsWith('.yaml'));

      if (files.length === 0) {
        continue;
      }

      const themes = [];

      for (const file of files) {
        const filePath = path.join(shellDir, file);
        try {
          const theme = parseThemeFile(filePath);
          themes.push(theme);
        } catch (err) {
          // Skip files that fail to parse
        }
      }

      if (themes.length > 0) {
        themesByShell[shell] = themes;
        totalCount += themes.length;
      }
    }

    for (const shell of Object.keys(themesByShell)) {
      const themes = themesByShell[shell];

      console.log(chalk.bold.cyan(`\n  ${shell.toUpperCase()} Themes`));
      console.log(chalk.dim('  ' + '─'.repeat(40)));

      for (const theme of themes) {
        const tags = (theme.tags || [])
          .map(tag => chalk.yellow(`[${tag}]`))
          .join(' ');

        const line = `  ${chalk.green(theme.id)}  ${chalk.dim('—')}  ${theme.description}`;
        console.log(tags ? `${line}  ${tags}` : line);
      }
    }

    console.log(chalk.bold(`\n  Total: ${totalCount} themes available`));
  } catch (err) {
    console.error(chalk.red(`Error listing themes: ${err.message}`));
    process.exitCode = 1;
  }
}

module.exports = list;
