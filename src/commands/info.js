'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { parseThemeFile } = require('../parser');
const { validateTheme } = require('../validator');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const SHELL_DIRS = ['bash', 'zsh', 'fish', 'starship'];

function findTheme(themeId) {
  for (const shell of SHELL_DIRS) {
    const dir = path.join(PROJECT_ROOT, 'themes', shell);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const parsed = parseThemeFile(filePath);
      if (parsed && parsed.id === themeId) {
        return { filePath, parsed };
      }
    }
  }
  return null;
}

function line(width) {
  return '─'.repeat(width);
}

function padEnd(str, width) {
  const visibleLen = stripAnsi(str).length;
  const pad = width - visibleLen;
  return str + (pad > 0 ? ' '.repeat(pad) : '');
}

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return String(str).replace(/\x1B\[[0-9;]*m/g, '');
}

function card(rows, cardWidth) {
  const inner = cardWidth - 2;
  const top    = '┌' + line(inner) + '┐';
  const bottom = '└' + line(inner) + '┘';
  const divider = '├' + line(inner) + '┤';

  const lines = [top];
  for (const row of rows) {
    if (row === '---') {
      lines.push(divider);
    } else {
      const padded = padEnd(row, inner);
      lines.push('│' + padded + '│');
    }
  }
  lines.push(bottom);
  return lines.join('\n');
}

function labelValue(label, value, labelWidth) {
  const l = chalk.bold.cyan(label.padEnd(labelWidth));
  const v = value !== undefined && value !== null && value !== '' ? String(value) : chalk.dim('N/A');
  return ' ' + l + ' ' + v;
}

function info(themeId) {
  if (!themeId) {
    console.error(chalk.red('Error: theme-id argument is required.'));
    console.error(chalk.dim('Usage: info <theme-id>'));
    process.exit(1);
  }

  const result = findTheme(themeId);
  if (!result) {
    console.error(chalk.red(`Theme not found: ${themeId}`));
    process.exit(1);
  }

  const { filePath, parsed } = result;

  const validation = validateTheme(parsed);
  if (validation && !validation.valid) {
    console.warn(chalk.yellow(`Warning: theme file has validation issues: ${validation.errors ? validation.errors.join(', ') : 'unknown'}`));
  }

  const t = parsed;
  const cardWidth = 62;
  const labelW = 14;

  const rows = [];

  // Title
  const titleText = ' ' + chalk.bold.white(t.name || themeId) + chalk.dim(` [${t.id || themeId}]`);
  rows.push(titleText);
  rows.push('---');

  // Basic info
  rows.push(labelValue('Shell',       t.shell,       labelW));
  rows.push(labelValue('Author',      t.author,      labelW));
  rows.push(labelValue('Version',     t.version,     labelW));
  rows.push(labelValue('Description', t.description, labelW));

  // Tags
  if (t.tags && t.tags.length > 0) {
    const tagStr = t.tags.map(tag => chalk.yellow(`#${tag}`)).join('  ');
    rows.push(labelValue('Tags', tagStr, labelW));
  }

  rows.push('---');

  // Colors
  rows.push(' ' + chalk.bold.white('Colors'));
  const colors = t.colors || {};
  rows.push(labelValue('  Primary',    colors.primary,    labelW + 2));
  rows.push(labelValue('  Secondary',  colors.secondary,  labelW + 2));
  rows.push(labelValue('  Background', colors.background, labelW + 2));

  // Segments
  if (t.segments && t.segments.length > 0) {
    rows.push('---');
    rows.push(' ' + chalk.bold.white('Segments'));
    for (const seg of t.segments) {
      const type     = chalk.green(seg.type     || '?');
      const style    = chalk.magenta(seg.style   || '?');
      const position = chalk.blue(seg.position   || '?');
      rows.push(` ${chalk.dim('•')} type=${type}  style=${style}  position=${position}`);
    }
  }

  // Dependencies
  rows.push('---');
  rows.push(' ' + chalk.bold.white('Dependencies'));
  const req = t.requires || {};
  const nfVal = req.nerd_font === true
    ? chalk.green('required')
    : req.nerd_font === false
      ? chalk.dim('not required')
      : chalk.dim('N/A');
  rows.push(labelValue('  Nerd Font', nfVal, labelW + 2));

  if (req.tools && req.tools.length > 0) {
    rows.push(labelValue('  Tools', req.tools.join(', '), labelW + 2));
  } else {
    rows.push(labelValue('  Tools', chalk.dim('none'), labelW + 2));
  }

  // Install instructions
  const install = t.prompt && t.prompt.install_instructions;
  if (install) {
    rows.push('---');
    rows.push(' ' + chalk.bold.white('Install Instructions'));
    const instrLines = String(install).split('\n');
    for (const instrLine of instrLines) {
      rows.push(' ' + chalk.dim(instrLine));
    }
  }

  console.log(card(rows, cardWidth));
}

module.exports = info;
