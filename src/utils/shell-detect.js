'use strict';

const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

/**
 * Detects the current shell from environment variables.
 * Falls back to $0, then 'bash'.
 * @returns {string} Normalized shell name: 'bash', 'zsh', or 'fish'
 */
function detectShell() {
  const shellEnv = process.env.SHELL || process.env['0'] || 'bash';
  const shellName = path.basename(shellEnv).toLowerCase();

  if (shellName.includes('zsh')) return 'zsh';
  if (shellName.includes('fish')) return 'fish';
  return 'bash';
}

/**
 * Returns the rc file path for the given shell (or config keyword).
 * @param {string} shell - 'bash', 'zsh', 'fish', or 'starship'
 * @returns {string} Absolute path to the rc file
 */
function getRcFilePath(shell) {
  const home = os.homedir();

  switch (shell) {
    case 'zsh':
      return path.join(home, '.zshrc');
    case 'fish':
      return path.join(home, '.config', 'fish', 'config.fish');
    case 'starship':
      return path.join(home, '.config', 'starship.toml');
    case 'bash':
    default:
      return path.join(home, '.bashrc');
  }
}

/**
 * Returns information about the current shell.
 * @returns {{ name: string, rcFile: string, version: string }}
 */
function getShellInfo() {
  const name = detectShell();
  const rcFile = getRcFilePath(name);

  let version = 'unknown';
  try {
    const output = execSync(`${name} --version`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const firstLine = output.split('\n')[0].trim();
    version = firstLine;
  } catch (_err) {
    // version remains 'unknown' if the command fails
  }

  return { name, rcFile, version };
}

module.exports = { detectShell, getRcFilePath, getShellInfo };
