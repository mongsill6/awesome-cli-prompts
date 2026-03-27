const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const os = require('os');
const { parseThemeFile } = require('../parser');
const { validateTheme } = require('../validator');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const THEME_DIRS = ['bash', 'zsh', 'fish', 'starship'];
const MARKER_START = (id) => `# === awesome-cli-prompts: ${id} ===`;
const MARKER_END = '# === /awesome-cli-prompts ===';

async function findThemeFile(themeId) {
  for (const dir of THEME_DIRS) {
    const themeDirPath = path.join(PROJECT_ROOT, 'themes', dir);
    if (!(await fs.pathExists(themeDirPath))) continue;

    const files = await fs.readdir(themeDirPath);
    for (const file of files) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;
      const filePath = path.join(themeDirPath, file);
      try {
        const parsed = parseThemeFile(filePath);
        if (parsed.id === themeId) {
          return filePath;
        }
      } catch {
        // skip unparseable files
      }
    }
  }
  return null;
}

function detectShell(options) {
  return options.shell || path.basename(process.env.SHELL || 'bash');
}

function getRcFilePath(shell) {
  const home = os.homedir();
  switch (shell) {
    case 'bash':
      return path.join(home, '.bashrc');
    case 'zsh':
      return path.join(home, '.zshrc');
    case 'fish':
      return path.join(home, '.config', 'fish', 'config.fish');
    case 'starship':
      return path.join(home, '.config', 'starship.toml');
    default:
      return path.join(home, '.bashrc');
  }
}

async function install(themeId, options) {
  const spinner = ora(`Installing theme "${themeId}"...`).start();

  try {
    // 1. Find theme file
    const themeFile = await findThemeFile(themeId);
    if (!themeFile) {
      spinner.fail(chalk.red(`Theme "${themeId}" not found.`));
      return;
    }

    // 2. Parse and validate
    const theme = parseThemeFile(themeFile);
    const errors = validateTheme(theme);
    if (errors && errors.length > 0) {
      spinner.fail(chalk.red(`Theme "${themeId}" is invalid:`));
      errors.forEach((err) => console.error(chalk.red(`  - ${err}`)));
      return;
    }

    // 3. Detect shell
    const detectedShell = detectShell(options);

    // 4. Check shell compatibility
    const themeShell = theme.shell;
    if (themeShell !== 'starship' && themeShell !== detectedShell) {
      spinner.warn(
        chalk.yellow(
          `Theme "${themeId}" is for ${themeShell}, but your shell is ${detectedShell}. Continuing anyway...`
        )
      );
      spinner.start(`Installing theme "${themeId}"...`);
    }

    // 5. Determine RC file path
    const isStarship = themeShell === 'starship';
    const rcFile = isStarship
      ? getRcFilePath('starship')
      : getRcFilePath(detectedShell);

    // 6. Backup RC file (only if backup doesn't already exist)
    const backupPath = `${rcFile}.acp.bak`;
    if (await fs.pathExists(rcFile)) {
      if (!(await fs.pathExists(backupPath))) {
        await fs.copy(rcFile, backupPath);
      }
    }

    // 7/8. Install theme
    if (isStarship) {
      // For starship: write toml content directly
      await fs.ensureDir(path.dirname(rcFile));
      await fs.writeFile(rcFile, theme.prompt.code, 'utf8');
    } else {
      // For shell themes: append marker comment block
      await fs.ensureDir(path.dirname(rcFile));
      const block = [
        '',
        MARKER_START(theme.id),
        theme.prompt.code,
        MARKER_END,
        '',
      ].join('\n');
      await fs.appendFile(rcFile, block, 'utf8');
    }

    // 9. Success
    spinner.succeed(
      chalk.green(`Theme "${themeId}" installed successfully to ${rcFile}`)
    );
  } catch (err) {
    spinner.fail(chalk.red(`Failed to install theme "${themeId}": ${err.message}`));
  }
}

module.exports = install;
