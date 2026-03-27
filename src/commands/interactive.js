const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { parseThemeFile } = require('../parser');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const SHELL_DIRS = ['bash', 'zsh', 'fish', 'starship'];

function loadThemesForShell(shell) {
  const dir = path.join(PROJECT_ROOT, 'themes', shell);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  const themes = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const theme = parseThemeFile(filePath);
      if (theme) themes.push(theme);
    } catch {
      // skip unparseable files
    }
  }

  return themes;
}

function loadAllThemes() {
  const all = [];
  for (const shell of SHELL_DIRS) {
    const themes = loadThemesForShell(shell);
    all.push(...themes);
  }
  return all;
}

function displayThemePreview(theme) {
  console.log(chalk.bold.cyan('\n  ┌─── Theme Preview ───────────────────┐'));
  console.log(chalk.white(`  │ Name:        ${theme.name}`));
  console.log(chalk.white(`  │ ID:          ${theme.id}`));
  console.log(chalk.white(`  │ Shell:       ${theme.shell}`));
  if (theme.author) console.log(chalk.white(`  │ Author:      ${theme.author}`));
  if (theme.version) console.log(chalk.white(`  │ Version:     ${theme.version}`));
  console.log(chalk.white(`  │ Description: ${theme.description}`));

  if (theme.tags && theme.tags.length > 0) {
    console.log(chalk.white(`  │ Tags:        ${theme.tags.map(t => chalk.yellow(t)).join(', ')}`));
  }

  console.log(chalk.bold.cyan('  ├─── Prompt Code ────────────────────┤'));

  const codeLines = (theme.prompt && theme.prompt.code ? theme.prompt.code : '').split('\n');
  for (const line of codeLines) {
    console.log(chalk.green(`  │ ${line}`));
  }

  console.log(chalk.bold.cyan('  └─────────────────────────────────────┘\n'));
}

async function interactive() {
  const inquirer = (await import('inquirer')).default;

  // Step 1: Select shell type
  const { shellChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'shellChoice',
      message: chalk.bold('Select a shell type:'),
      choices: [
        { name: 'All shells', value: 'all' },
        ...SHELL_DIRS.map(s => ({ name: s, value: s })),
      ],
    },
  ]);

  // Load themes based on selection
  const themes = shellChoice === 'all' ? loadAllThemes() : loadThemesForShell(shellChoice);

  if (themes.length === 0) {
    console.log(chalk.yellow('\n  No themes found for the selected shell.\n'));
    return;
  }

  // Step 2: Show theme list (loop to support "Back to list")
  let keepBrowsing = true;

  while (keepBrowsing) {
    const themeChoices = themes.map(theme => {
      const tags = (theme.tags || []).map(t => chalk.yellow(`[${t}]`)).join(' ');
      const label = `${chalk.green(theme.name || theme.id)}  ${chalk.dim('—')}  ${theme.description}${tags ? '  ' + tags : ''}`;
      return { name: label, value: theme };
    });

    themeChoices.push(new inquirer.Separator());
    themeChoices.push({ name: chalk.dim('Exit'), value: null });

    const { selectedTheme } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTheme',
        message: chalk.bold('Select a theme:'),
        choices: themeChoices,
        pageSize: 15,
      },
    ]);

    if (!selectedTheme) {
      console.log(chalk.dim('\n  Goodbye!\n'));
      break;
    }

    // Step 3: Action menu for selected theme
    let inThemeMenu = true;

    while (inThemeMenu) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: chalk.bold(`Theme: ${chalk.cyan(selectedTheme.name || selectedTheme.id)} — Choose an action:`),
          choices: [
            { name: 'Preview', value: 'preview' },
            { name: 'Install', value: 'install' },
            { name: 'Back to list', value: 'back' },
            { name: 'Exit', value: 'exit' },
          ],
        },
      ]);

      if (action === 'preview') {
        displayThemePreview(selectedTheme);
      } else if (action === 'install') {
        const install = require('./install');
        await install(selectedTheme.id, {});
        inThemeMenu = false;
        keepBrowsing = false;
      } else if (action === 'back') {
        inThemeMenu = false;
      } else if (action === 'exit') {
        console.log(chalk.dim('\n  Goodbye!\n'));
        inThemeMenu = false;
        keepBrowsing = false;
      }
    }
  }
}

module.exports = interactive;
