const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const ora = require('ora');

async function uninstall() {
  try {
    const shell = path.basename(process.env.SHELL || 'bash');

    const rcFileMap = {
      bash: path.join(os.homedir(), '.bashrc'),
      zsh: path.join(os.homedir(), '.zshrc'),
      fish: path.join(os.homedir(), '.config', 'fish', 'config.fish'),
      starship: path.join(os.homedir(), '.config', 'starship.toml'),
    };

    const rcFile = rcFileMap[shell] || rcFileMap.bash;
    const backupFile = `${rcFile}.acp.bak`;

    const backupExists = await fs.pathExists(backupFile);

    if (backupExists) {
      const spinner = ora('Restoring backup...').start();
      try {
        await fs.copy(backupFile, rcFile, { overwrite: true });
        await fs.remove(backupFile);
        spinner.succeed(chalk.green('Theme uninstalled and RC file restored from backup'));
      } catch (err) {
        spinner.fail(chalk.red(`Failed to restore backup: ${err.message}`));
      }
    } else {
      try {
        const content = await fs.readFile(rcFile, 'utf8');
        const startMarker = '# === awesome-cli-prompts:';
        const endMarker = '# === /awesome-cli-prompts ===';

        const startIdx = content.indexOf(startMarker);
        const endIdx = content.indexOf(endMarker);

        if (startIdx !== -1 && endIdx !== -1) {
          const before = content.substring(0, startIdx);
          const after = content.substring(endIdx + endMarker.length);
          const cleaned = before + after.replace(/^\r?\n/, '');
          await fs.writeFile(rcFile, cleaned, 'utf8');
          console.log(chalk.green('Theme uninstalled and RC file cleaned'));
        } else {
          console.log(chalk.yellow('No awesome-cli-prompts theme found in your shell config'));
        }
      } catch (err) {
        console.log(chalk.red(`Failed to clean RC file: ${err.message}`));
      }
    }
  } catch (err) {
    console.log(chalk.red(`Uninstall failed: ${err.message}`));
  }
}

module.exports = uninstall;
