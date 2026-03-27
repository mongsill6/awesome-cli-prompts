'use strict';

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const Fuse = require('fuse.js');
const { parseThemeFile } = require('../parser');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const THEME_DIRS = ['bash', 'zsh', 'fish', 'starship'];

function loadAllThemes(shellFilter) {
  const themes = [];
  const dirs = shellFilter ? [shellFilter] : THEME_DIRS;

  for (const dir of dirs) {
    const themeDirPath = path.join(PROJECT_ROOT, 'themes', dir);

    if (!fs.existsSync(themeDirPath)) {
      continue;
    }

    let files;
    try {
      files = fs.readdirSync(themeDirPath);
    } catch (err) {
      continue;
    }

    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

    for (const file of yamlFiles) {
      const filePath = path.join(themeDirPath, file);
      try {
        const theme = parseThemeFile(filePath);
        if (theme) {
          themes.push({ ...theme, shell: dir });
        }
      } catch (err) {
        // skip unparseable files
      }
    }
  }

  return themes;
}

function search(query, options = {}) {
  const { shell, limit = 10 } = options;

  if (!query || query.trim() === '') {
    console.error(chalk.red('Error: search query is required'));
    process.exit(1);
  }

  const themes = loadAllThemes(shell);

  if (themes.length === 0) {
    console.log(chalk.yellow('No themes found' + (shell ? ` for shell: ${shell}` : '') + '.'));
    return;
  }

  const fuse = new Fuse(themes, {
    keys: ['name', 'id', 'description', 'tags'],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
  });

  const results = fuse.search(query, { limit: Number(limit) });

  if (results.length === 0) {
    console.log(chalk.yellow(`No themes matched "${query}".`));
    return;
  }

  console.log(chalk.bold(`\nSearch results for "${query}" (${results.length} found):\n`));

  for (const result of results) {
    const { item, score } = result;
    const matchScore = score !== undefined ? (1 - score) * 100 : 0;

    console.log(
      chalk.green(item.id || 'unknown') +
      '  ' +
      chalk.bold(item.name || '') +
      '  ' +
      chalk.cyan(`[${item.shell}]`)
    );

    if (item.description) {
      console.log('  ' + item.description);
    }

    if (item.tags && item.tags.length > 0) {
      const tagList = Array.isArray(item.tags) ? item.tags : [item.tags];
      console.log('  Tags: ' + tagList.map(t => chalk.yellow(t)).join(', '));
    }

    console.log('  ' + chalk.dim(`Match score: ${matchScore.toFixed(1)}%`));
    console.log();
  }
}

module.exports = search;
