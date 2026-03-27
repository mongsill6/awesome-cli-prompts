const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { parseThemeFile } = require('../parser');
const { validateTheme } = require('../validator');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const SHELL_DIRS = ['bash', 'zsh', 'fish', 'starship'];

async function preview(themeId) {
  // 1. Find the theme by scanning themes/{bash,zsh,fish,starship}/ directories
  let themeFilePath = null;

  for (const shell of SHELL_DIRS) {
    const dir = path.join(PROJECT_ROOT, 'themes', shell);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const parsed = parseThemeFile(filePath);
      if (parsed && parsed.id === themeId) {
        themeFilePath = filePath;
        break;
      }
    }
    if (themeFilePath) break;
  }

  if (!themeFilePath) {
    console.log(chalk.red(`\n  Error: Theme with id "${themeId}" not found.`));
    return;
  }

  // 2. Parse and validate
  const theme = parseThemeFile(themeFilePath);
  const errors = validateTheme(theme);

  if (errors && errors.length > 0) {
    console.log(chalk.red(`\n  Validation errors for theme "${themeId}":`));
    errors.forEach(err => console.log(chalk.red(`    - ${err}`)));
    return;
  }

  // 3. Display preview box
  console.log(chalk.bold.cyan('\n  ┌─── Theme Preview ───────────────────┐'));
  console.log(chalk.white(`  │ Name:        ${theme.name}`));
  console.log(chalk.white(`  │ ID:          ${theme.id}`));
  console.log(chalk.white(`  │ Shell:       ${theme.shell}`));
  console.log(chalk.white(`  │ Author:      ${theme.author}`));
  console.log(chalk.white(`  │ Version:     ${theme.version}`));
  console.log(chalk.white(`  │ Description: ${theme.description}`));

  if (theme.tags && theme.tags.length > 0) {
    console.log(chalk.white(`  │ Tags:        ${theme.tags.map(t => chalk.yellow(t)).join(', ')}`));
  }

  console.log(chalk.bold.cyan('  ├─── Prompt Code ────────────────────┤'));

  // Display prompt code with syntax highlighting
  const codeLines = (theme.prompt && theme.prompt.code ? theme.prompt.code : '').split('\n');
  for (const line of codeLines) {
    console.log(chalk.green(`  │ ${line}`));
  }

  console.log(chalk.bold.cyan('  └─────────────────────────────────────┘'));

  // 4. Simulated prompt line
  console.log(chalk.dim('\n  Simulated output:'));

  const colors = theme.colors || {};
  const pathColor = colors.path ? chalk.hex(colors.path) : chalk.blue;
  const symbolColor = colors.symbol ? chalk.hex(colors.symbol) : chalk.magenta;

  console.log(`  ${pathColor('~/projects')} ${symbolColor('❯')} `);
}

module.exports = preview;
