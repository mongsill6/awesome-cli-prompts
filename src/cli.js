#!/usr/bin/env node

const { program } = require('commander');

program
  .name('awesome-cli-prompts')
  .description('A CLI tool to manage and install awesome shell prompt themes')
  .version('0.1.0');

program
  .command('list')
  .description('List all available themes')
  .option('--shell <shell>', 'Filter by shell type (bash/zsh/fish/starship)')
  .action((options) => {
    const list = require('./commands/list');
    list(options);
  });

program
  .command('install <theme-id>')
  .description('Install a theme to your shell')
  .option('--shell <shell>', 'Override auto-detected shell')
  .action((themeId, options) => {
    const install = require('./commands/install');
    install(themeId, options);
  });

program
  .command('preview <theme-id>')
  .description('Preview a theme in terminal')
  .action((themeId) => {
    const preview = require('./commands/preview');
    preview(themeId);
  });

program
  .command('uninstall')
  .description('Uninstall current theme and restore backup')
  .action(() => {
    const uninstall = require('./commands/uninstall');
    uninstall();
  });

program
  .command('search <query>')
  .description('Fuzzy search themes by name, tags, or description')
  .option('--shell <shell>', 'Filter by shell type (bash/zsh/fish/starship)')
  .option('--limit <n>', 'Limit results', '10')
  .action((query, options) => {
    const search = require('./commands/search');
    search(query, options);
  });

program
  .command('info <theme-id>')
  .description('Show detailed information about a theme')
  .action((themeId) => {
    const info = require('./commands/info');
    info(themeId);
  });

program
  .command('interactive')
  .description('Interactive theme browser')
  .action(async () => {
    const interactive = require('./commands/interactive');
    await interactive();
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse();
