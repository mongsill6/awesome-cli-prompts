#!/usr/bin/env node

/**
 * generate-gallery.js
 * Auto-generates docs/GALLERY.md by scanning themes/ for YAML files,
 * parsing each with src/parser.js, and producing a grouped Markdown gallery.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT        = path.resolve(__dirname, '..');
const THEMES_DIR  = path.join(ROOT, 'themes');
const OUTPUT_FILE = path.join(ROOT, 'docs', 'GALLERY.md');

// ---------------------------------------------------------------------------
// Attempt to load the project parser; fall back to a minimal YAML parser
// if src/parser.js does not exist yet.
// ---------------------------------------------------------------------------
let parseTheme;
try {
  const parser = require('../src/parser.js');
  parseTheme = parser.parseThemeFile;
} catch (_) {
  // Minimal YAML key:value parser (handles strings, arrays, nested objects
  // at one level deep) — good enough for the gallery script when parser.js
  // is not yet available.
  parseTheme = function minimalParse(filePath) {
    const raw  = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split('\n');
    const obj  = {};
    let currentKey   = null;
    let inArray      = false;
    let inBlock      = false;
    let blockKey     = null;
    let blockIndent  = 0;
    const blockObj   = {};

    for (const line of lines) {
      // Skip comment-only lines
      if (/^\s*#/.test(line)) continue;

      const arrayItem = line.match(/^(\s*)-\s+(.+)$/);
      const kvMatch   = line.match(/^(\w[\w.]*)\s*:\s*(.*)$/);
      const blockStart = line.match(/^(\w[\w.]*)\s*:\s*$/);
      const nestedKV  = line.match(/^\s{2,}(\w[\w.]*)\s*:\s*(.*)$/);

      if (blockStart) {
        inBlock     = true;
        blockKey    = blockStart[1];
        blockIndent = 0;
        blockObj[blockKey] = {};
        inArray     = false;
        currentKey  = null;
        continue;
      }

      if (inBlock && nestedKV) {
        const [, k, v] = nestedKV;
        blockObj[blockKey][k] = v.replace(/^['"]|['"]$/g, '');
        obj[blockKey] = { ...(obj[blockKey] || {}), ...blockObj[blockKey] };
        continue;
      }

      if (kvMatch && !inBlock) {
        inArray    = false;
        currentKey = kvMatch[1];
        const val  = kvMatch[2].trim().replace(/^['"]|['"]$/g, '');
        if (val === '') {
          obj[currentKey] = null;
        } else {
          obj[currentKey] = val;
        }
        continue;
      }

      if (arrayItem && currentKey) {
        if (!inArray) {
          obj[currentKey] = [];
          inArray = true;
        }
        if (!Array.isArray(obj[currentKey])) obj[currentKey] = [];
        obj[currentKey].push(arrayItem[2].trim().replace(/^['"]|['"]$/g, ''));
        continue;
      }

      // Any non-indented content resets block mode
      if (line.trim() !== '' && !/^\s/.test(line)) {
        inBlock = false;
      }
    }

    return obj;
  };
}

// ---------------------------------------------------------------------------
// Shell groups — order determines gallery order
// ---------------------------------------------------------------------------
const SHELLS = ['bash', 'zsh', 'fish', 'starship'];

const SHELL_LABELS = {
  bash:     'Bash',
  zsh:      'Zsh',
  fish:     'Fish',
  starship: 'Starship',
};

const SHELL_DESCRIPTIONS = {
  bash:     'Classic and universally available. These prompts work with plain Bash (4.x+).',
  zsh:      'Featureful prompts for Zsh, taking advantage of PROMPT_SUBST and hooks.',
  fish:     'Beautiful prompts for the Friendly Interactive Shell.',
  starship: 'Cross-shell prompts configured via TOML/YAML for use with Starship.',
};

// ---------------------------------------------------------------------------
// Helper: collect .yaml files inside a directory (non-recursive, skip .toml)
// ---------------------------------------------------------------------------
function collectYamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => path.join(dir, f));
}

// ---------------------------------------------------------------------------
// Helper: safe string — return value or fallback
// ---------------------------------------------------------------------------
function s(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  return String(val);
}

// ---------------------------------------------------------------------------
// Helper: render tag badges  (plain Markdown, no external badge service)
// ---------------------------------------------------------------------------
function renderTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  return tags.map((t) => `\`${t}\``).join(' ');
}

// ---------------------------------------------------------------------------
// Helper: GitHub-compatible anchor from heading text
// ---------------------------------------------------------------------------
function anchor(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ---------------------------------------------------------------------------
// Build the gallery Markdown string
// ---------------------------------------------------------------------------
function buildGallery(themesByShell) {
  const lines = [];
  const now   = new Date().toUTCString();

  // ── Header ──────────────────────────────────────────────────────────────
  lines.push('# Awesome CLI Prompts — Theme Gallery');
  lines.push('');
  lines.push(
    '> A curated collection of beautiful, feature-rich command-line prompt themes ' +
    'for Bash, Zsh, Fish, and Starship. Browse the gallery below, then install ' +
    'any theme with a single command.'
  );
  lines.push('');
  lines.push('```bash');
  lines.push('# Install any theme');
  lines.push('acp install <id>');
  lines.push('```');
  lines.push('');

  // ── Table of Contents ────────────────────────────────────────────────────
  lines.push('## Table of Contents');
  lines.push('');

  for (const shell of SHELLS) {
    const themes = themesByShell[shell] || [];
    if (themes.length === 0) continue;

    const label     = SHELL_LABELS[shell];
    const shellAnchor = anchor(label);
    lines.push(`- [${label}](#${shellAnchor})`);

    for (const theme of themes) {
      const name        = s(theme.name, path.basename(theme._file, '.yaml'));
      const themeAnchor = anchor(`${label} ${name}`);
      lines.push(`  - [${name}](#${themeAnchor})`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  // ── Per-shell sections ───────────────────────────────────────────────────
  for (const shell of SHELLS) {
    const themes = themesByShell[shell] || [];
    if (themes.length === 0) continue;

    const label = SHELL_LABELS[shell];
    const desc  = SHELL_DESCRIPTIONS[shell];

    lines.push(`## ${label}`);
    lines.push('');
    lines.push(desc);
    lines.push('');

    for (const theme of themes) {
      const id          = s(theme.id,      path.basename(theme._file, '.yaml'));
      const name        = s(theme.name,    id);
      const author      = s(theme.author,  'Unknown');
      const version     = s(theme.version, '1.0.0');
      const description = s(theme.description, '_No description provided._');
      const tags        = theme.tags;

      // Heading uses the compound anchor so TOC links work
      lines.push(`### ${name}`);
      lines.push('');

      // Description
      lines.push(description);
      lines.push('');

      // SVG preview
      lines.push(`![${name}](../previews/${shell}/${id}.svg)`);
      lines.push('');

      // Metadata table
      lines.push('| | |');
      lines.push('|---|---|');
      lines.push(`| **Author** | ${author} |`);
      lines.push(`| **Version** | ${version} |`);
      lines.push(`| **Shell** | ${label} |`);
      lines.push(`| **ID** | \`${id}\` |`);

      if (Array.isArray(tags) && tags.length > 0) {
        lines.push(`| **Tags** | ${renderTags(tags)} |`);
      }

      // Optional: nerd font / tools requirements
      if (theme.requires) {
        const req = theme.requires;
        const parts = [];
        if (req.nerd_font === 'true' || req.nerd_font === true) {
          parts.push('[Nerd Font](https://www.nerdfonts.com/)');
        }
        if (Array.isArray(req.tools) && req.tools.length > 0) {
          parts.push(...req.tools.map((t) => `\`${t}\``));
        }
        if (parts.length > 0) {
          lines.push(`| **Requires** | ${parts.join(', ')} |`);
        }
      }

      lines.push('');

      // Install command
      lines.push('**Install**');
      lines.push('');
      lines.push('```bash');
      lines.push(`acp install ${id}`);
      lines.push('```');
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  lines.push('');
  lines.push('<sub>');
  lines.push(`Generated automatically by \`scripts/generate-gallery.js\` on ${now}.`);
  lines.push('');
  lines.push(
    'To regenerate after adding or editing themes, run: ' +
    '`node scripts/generate-gallery.js`'
  );
  lines.push('</sub>');
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const themesByShell = {};

  for (const shell of SHELLS) {
    const dir   = path.join(THEMES_DIR, shell);
    const files = collectYamlFiles(dir);

    themesByShell[shell] = [];

    for (const file of files) {
      let theme;
      try {
        theme = parseTheme(file);
      } catch (err) {
        console.warn(`  [warn] Failed to parse ${file}: ${err.message}`);
        continue;
      }

      // Attach source file path for fallback naming
      theme._file = file;

      // Normalise shell field — use directory name if not set in YAML
      if (!theme.shell) theme.shell = shell;

      themesByShell[shell].push(theme);
    }

    // Sort alphabetically by name / id
    themesByShell[shell].sort((a, b) => {
      const nameA = s(a.name || a.id || path.basename(a._file, '.yaml')).toLowerCase();
      const nameB = s(b.name || b.id || path.basename(b._file, '.yaml')).toLowerCase();
      return nameA.localeCompare(nameB);
    });

    console.log(
      `  ${SHELL_LABELS[shell]}: found ${themesByShell[shell].length} theme(s)`
    );
  }

  const markdown = buildGallery(themesByShell);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');

  console.log(`\nGallery written to: ${OUTPUT_FILE}`);
}

main();
