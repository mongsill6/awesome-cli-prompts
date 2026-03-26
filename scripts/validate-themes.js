#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { validateTheme } = require('../src/validator');

const themesDir = path.join(__dirname, '..', 'themes');
let totalFiles = 0;
let passCount = 0;
let failCount = 0;

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
      totalFiles++;
      const rel = path.relative(themesDir, fullPath);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const theme = yaml.parse(content);
        const result = validateTheme(theme);
        if (result.valid) {
          console.log(`  ✓ ${rel}`);
          passCount++;
        } else {
          console.log(`  ✗ ${rel}`);
          result.errors.forEach(e => console.log(`      - ${e}`));
          failCount++;
        }
      } catch (err) {
        console.log(`  ✗ ${rel} — parse error: ${err.message}`);
        failCount++;
      }
    }
  }
}

console.log('Validating themes...\n');
walkDir(themesDir);
console.log(`\nResults: ${passCount}/${totalFiles} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
