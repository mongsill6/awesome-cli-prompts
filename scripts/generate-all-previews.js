#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { generatePreview } = require('./generate-preview');

const FORCE = process.argv.includes('--force');

const ROOT = path.resolve(__dirname, '..');
const THEMES_DIR = path.join(ROOT, 'themes');
const PREVIEWS_DIR = path.join(ROOT, 'previews');

const SHELL_DIRS = ['bash', 'zsh', 'fish', 'starship'];

function ensureOutputDirs() {
  for (const shell of SHELL_DIRS) {
    const dir = path.join(PREVIEWS_DIR, shell);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function scanYamlFiles(shellDir) {
  const dirPath = path.join(THEMES_DIR, shellDir);
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  const yamlFiles = [];

  for (const entry of files) {
    if (entry.isDirectory()) {
      const subDir = path.join(dirPath, entry.name);
      const subFiles = fs.readdirSync(subDir, { withFileTypes: true });
      for (const subEntry of subFiles) {
        if (subEntry.isFile() && subEntry.name.endsWith('.yaml')) {
          yamlFiles.push(path.join(subDir, subEntry.name));
        }
      }
    } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
      yamlFiles.push(path.join(dirPath, entry.name));
    }
  }

  return yamlFiles;
}

function isSvgUpToDate(svgPath, yamlPath) {
  if (!fs.existsSync(svgPath)) return false;
  const svgStat = fs.statSync(svgPath);
  const yamlStat = fs.statSync(yamlPath);
  return svgStat.mtimeMs >= yamlStat.mtimeMs;
}

async function main() {
  ensureOutputDirs();

  let total = 0;
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (const shell of SHELL_DIRS) {
    const yamlFiles = scanYamlFiles(shell);
    if (yamlFiles.length === 0) {
      console.log(`  [${shell}] No YAML files found, skipping.`);
      continue;
    }

    console.log(`\nProcessing ${shell}/ (${yamlFiles.length} themes):`);
    const outputDir = path.join(PREVIEWS_DIR, shell);

    for (const yamlPath of yamlFiles) {
      total++;
      const baseName = path.basename(yamlPath, '.yaml');
      const expectedSvg = path.join(outputDir, `${baseName}.svg`);

      if (!FORCE && isSvgUpToDate(expectedSvg, yamlPath)) {
        console.log(`  - ${baseName} (skipped, up-to-date)`);
        skipped++;
        continue;
      }

      try {
        const result = await generatePreview(yamlPath, outputDir);
        console.log(`  ✓ ${result.id || baseName}`);
        generated++;
      } catch (err) {
        console.log(`  ✗ ${baseName}: ${err.message}`);
        failures.push({ shell, name: baseName, error: err.message });
        failed++;
      }
    }
  }

  console.log('\n─────────────────────────────');
  console.log(`Summary:`);
  console.log(`  Total themes found : ${total}`);
  console.log(`  Generated          : ${generated}`);
  console.log(`  Skipped (up-to-date): ${skipped}`);
  console.log(`  Failed             : ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  [${f.shell}] ${f.name}: ${f.error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
