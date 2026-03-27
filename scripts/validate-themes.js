#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { validateTheme } = require('../src/validator');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const jsonOutput = args.includes('--json');

const themesDir = path.join(__dirname, '..', 'themes');
let totalFiles = 0;
let passCount = 0;
let failCount = 0;
let warnCount = 0;

const seenIds = new Map(); // id -> relative path
const shellStats = {}; // shell -> { pass, fail, warn }
const jsonResults = [];

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isValidHex(value) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}

function recordShell(shell, outcome) {
  if (!shellStats[shell]) {
    shellStats[shell] = { pass: 0, fail: 0, warn: 0 };
  }
  shellStats[shell][outcome]++;
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
      totalFiles++;
      const rel = path.relative(themesDir, fullPath);

      // Determine expected shell from parent directory relative to themesDir
      const relDir = path.dirname(rel);
      const expectedShell = relDir === '.' ? null : relDir.split(path.sep)[0];

      // Determine expected id from filename (strip extension)
      const expectedId = path.basename(entry.name, path.extname(entry.name));

      const errors = [];
      const warnings = [];

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const theme = yaml.parse(content);

        // Run existing validator
        const result = validateTheme(theme);
        if (!result.valid) {
          errors.push(...result.errors);
        }

        // 1. Check that theme id matches filename
        if (theme.id === undefined || theme.id === null) {
          errors.push(`id is missing (expected "${expectedId}")`);
        } else if (String(theme.id) !== expectedId) {
          errors.push(`id "${theme.id}" does not match filename "${expectedId}"`);
        }

        // 2. Check that theme shell matches parent directory
        if (expectedShell) {
          if (theme.shell === undefined || theme.shell === null) {
            errors.push(`shell is missing (expected "${expectedShell}")`);
          } else if (String(theme.shell) !== expectedShell) {
            errors.push(`shell "${theme.shell}" does not match parent directory "${expectedShell}"`);
          }
        }

        // 3. Duplicate ID detection (collected during walk, reported inline)
        const themeId = theme.id !== undefined ? String(theme.id) : expectedId;
        if (seenIds.has(themeId)) {
          errors.push(`duplicate id "${themeId}" (first seen in ${seenIds.get(themeId)})`);
        } else {
          seenIds.set(themeId, rel);
        }

        // 4. Validate colors.primary and colors.secondary as hex if present
        if (theme.colors) {
          if (theme.colors.primary !== undefined && !isValidHex(theme.colors.primary)) {
            errors.push(`colors.primary "${theme.colors.primary}" is not a valid hex color (expected #RGB or #RRGGBB)`);
          }
          if (theme.colors.secondary !== undefined && !isValidHex(theme.colors.secondary)) {
            errors.push(`colors.secondary "${theme.colors.secondary}" is not a valid hex color (expected #RGB or #RRGGBB)`);
          }
        }

        // 5. Warn if description is shorter than 10 characters
        if (theme.description !== undefined && theme.description !== null) {
          if (String(theme.description).length < 10) {
            warnings.push(`description "${theme.description}" is shorter than 10 characters`);
          }
        }

        const shell = (theme.shell ? String(theme.shell) : expectedShell) || 'unknown';
        const hasFail = errors.length > 0;
        const hasWarn = warnings.length > 0;

        if (hasFail) {
          failCount++;
          recordShell(shell, 'fail');
          if (!jsonOutput) {
            console.log(`  ✗ ${rel}`);
            errors.forEach(e => console.log(`      ERROR: ${e}`));
            if (verbose) {
              warnings.forEach(w => console.log(`      WARN:  ${w}`));
            }
          }
        } else {
          passCount++;
          recordShell(shell, 'pass');
          if (!jsonOutput) {
            if (hasWarn) {
              console.log(`  ⚠ ${rel}`);
              warnings.forEach(w => console.log(`      WARN:  ${w}`));
            } else {
              console.log(`  ✓ ${rel}`);
              if (verbose) {
                console.log(`      id: ${theme.id}, shell: ${theme.shell}`);
              }
            }
          }
        }

        if (hasWarn) {
          warnCount++;
          recordShell(shell, 'warn');
        }

        if (jsonOutput) {
          jsonResults.push({
            file: rel,
            id: theme.id,
            shell: theme.shell,
            valid: !hasFail,
            errors,
            warnings,
          });
        }
      } catch (err) {
        failCount++;
        const shell = expectedShell || 'unknown';
        recordShell(shell, 'fail');
        if (!jsonOutput) {
          console.log(`  ✗ ${rel} — parse error: ${err.message}`);
        }
        if (jsonOutput) {
          jsonResults.push({
            file: rel,
            id: null,
            shell: null,
            valid: false,
            errors: [`parse error: ${err.message}`],
            warnings: [],
          });
        }
      }
    }
  }
}

if (!jsonOutput) {
  console.log('Validating themes...\n');
}

walkDir(themesDir);

if (jsonOutput) {
  const output = {
    summary: {
      total: totalFiles,
      passed: passCount,
      failed: failCount,
      warnings: warnCount,
    },
    byShell: shellStats,
    themes: jsonResults,
  };
  console.log(JSON.stringify(output, null, 2));
} else {
  // Summary line
  console.log(`\nResults: ${passCount}/${totalFiles} passed, ${failCount} failed, ${warnCount} with warnings`);

  // Summary grouped by shell
  const shells = Object.keys(shellStats).sort();
  if (shells.length > 0) {
    console.log('\nBy shell:');
    for (const shell of shells) {
      const s = shellStats[shell];
      const total = s.pass + s.fail;
      const warnNote = s.warn > 0 ? `, ${s.warn} with warnings` : '';
      console.log(`  ${shell.padEnd(12)} ${s.pass}/${total} passed, ${s.fail} failed${warnNote}`);
    }
  }
}

process.exit(failCount > 0 ? 1 : 0);
