#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// ANSI 256-colour palette → hex  (only the 216-colour cube + greys matter here)
// ---------------------------------------------------------------------------
function ansi256ToHex(code) {
  const n = parseInt(code, 10);
  if (isNaN(n) || n < 0 || n > 255) return '#ffffff';

  // Standard 16 colours (approximate)
  const standard16 = [
    '#000000', '#cc0000', '#4e9a06', '#c4a000',
    '#3465a4', '#75507b', '#06989a', '#d3d7cf',
    '#555753', '#ef2929', '#8ae234', '#fce94f',
    '#729fcf', '#ad7fa8', '#34e2e2', '#eeeeec',
  ];
  if (n < 16) return standard16[n];

  // 6×6×6 colour cube (indices 16–231)
  if (n < 232) {
    const idx = n - 16;
    const b = idx % 6;
    const g = Math.floor(idx / 6) % 6;
    const r = Math.floor(idx / 36);
    const chan = v => v === 0 ? 0 : 55 + v * 40;
    return `#${[r, g, b].map(v => chan(v).toString(16).padStart(2, '0')).join('')}`;
  }

  // Greyscale ramp (indices 232–255)
  const level = (n - 232) * 10 + 8;
  const h = level.toString(16).padStart(2, '0');
  return `#${h}${h}${h}`;
}

/**
 * Parse a style string like "38;5;39" or "1;38;5;201" into {fg, bold}.
 * Returns { fg: '#rrggbb', bold: boolean }.
 */
function parseStyle(style) {
  if (!style) return { fg: '#cdd6f4', bold: false };
  const parts = String(style).split(';').map(p => p.trim());
  let bold = false;
  let fg = '#cdd6f4';

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '1') { bold = true; continue; }
    // 38;5;N  →  256-colour fg
    if (parts[i] === '38' && parts[i + 1] === '5' && parts[i + 2] !== undefined) {
      fg = ansi256ToHex(parts[i + 2]);
      i += 2;
      continue;
    }
    // 38;2;R;G;B  →  true-colour fg
    if (parts[i] === '38' && parts[i + 1] === '2' &&
        parts[i + 2] !== undefined && parts[i + 3] !== undefined && parts[i + 4] !== undefined) {
      const r = parseInt(parts[i + 2], 10).toString(16).padStart(2, '0');
      const g = parseInt(parts[i + 3], 10).toString(16).padStart(2, '0');
      const b = parseInt(parts[i + 4], 10).toString(16).padStart(2, '0');
      fg = `#${r}${g}${b}`;
      i += 4;
      continue;
    }
    // Basic 30-37 colours
    const basic = { 30: '#000000', 31: '#cc0000', 32: '#4e9a06', 33: '#c4a000',
                    34: '#3465a4', 35: '#75507b', 36: '#06989a', 37: '#d3d7cf' };
    if (basic[parts[i]]) { fg = basic[parts[i]]; continue; }
    // Bright 90-97
    const bright = { 90: '#555753', 91: '#ef2929', 92: '#8ae234', 93: '#fce94f',
                     94: '#729fcf', 95: '#ad7fa8', 96: '#34e2e2', 97: '#eeeeec' };
    if (bright[parts[i]]) { fg = bright[parts[i]]; continue; }
  }
  return { fg, bold };
}

// ---------------------------------------------------------------------------
// Sample content per segment type
// ---------------------------------------------------------------------------
const SEGMENT_SAMPLES = {
  directory:  { text: '~/projects/awesome-app', sep: ' ' },
  git_branch: { text: ' main', sep: ' ' },
  time:       { text: '14:30:21', sep: ' ' },
  user:       { text: 'user', sep: '' },
  hostname:   { text: 'hostname', sep: ' ' },
  exit_code:  { text: '', sep: '' },          // success → nothing shown
  character:  { text: '❯', sep: ' ' },
  virtualenv: { text: '(venv)', sep: ' ' },
  kubernetes: { text: '⎈ prod', sep: ' ' },
  docker:     { text: '🐳 running', sep: ' ' },
};

function getSegmentText(type) {
  return SEGMENT_SAMPLES[type] || { text: type, sep: ' ' };
}

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Measure approximate pixel width of a monospace string.
 * Assumes font-size 14px, monospace char width ≈ 8.4px.
 * Emoji / wide chars count as 2.
 */
function measureText(str, fontSize = 14) {
  const charWidth = fontSize * 0.60;
  let width = 0;
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    // Emoji / CJK wide characters
    const isWide = cp > 0x2e7f;
    width += isWide ? charWidth * 2 : charWidth;
  }
  return width;
}

// ---------------------------------------------------------------------------
// Build prompt tokens from theme segments
// ---------------------------------------------------------------------------
function buildPromptTokens(segments) {
  const left = (segments || []).filter(s => !s.position || s.position === 'left');
  const tokens = [];

  for (const seg of left) {
    const { text, sep } = getSegmentText(seg.type);
    if (!text) continue;
    const { fg, bold } = parseStyle(seg.style);
    tokens.push({ text: text + sep, fg, bold });
  }

  // If no character segment, add a default one
  const hasChar = left.some(s => s.type === 'character');
  if (!hasChar) {
    tokens.push({ text: '❯ ', fg: '#a6e3a1', bold: true });
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Render a line of tokens as SVG <tspan> elements, return {svg, width}
// ---------------------------------------------------------------------------
function renderTokenLine(tokens, x, y, fontSize) {
  let svgParts = [];
  let cx = x;
  for (const { text, fg, bold } of tokens) {
    const w = measureText(text, fontSize);
    const weight = bold ? 'bold' : 'normal';
    svgParts.push(
      `<tspan x="${cx.toFixed(1)}" y="${y}" fill="${escapeXml(fg)}" font-weight="${weight}">${escapeXml(text)}</tspan>`
    );
    cx += w;
  }
  return { svg: svgParts.join(''), endX: cx };
}

// ---------------------------------------------------------------------------
// Main SVG generator
// ---------------------------------------------------------------------------
function buildSVG(theme) {
  const WIDTH  = 700;
  const HEIGHT = 300;
  const TITLE_H = 36;
  const PAD_X   = 20;
  const FONT_SIZE = 14;
  const LINE_H    = FONT_SIZE * 1.8;

  const bg = (theme.colors && theme.colors.background) || '#1e1e2e';
  const textColor = '#cdd6f4';
  const dimColor  = '#6c7086';

  // Prompt tokens
  const segments = theme.segments || [];
  const promptTokens = buildPromptTokens(segments);

  // ── Title bar ──────────────────────────────────────────────────────────────
  const titleBar = `
  <rect x="0" y="0" width="${WIDTH}" height="${TITLE_H}" rx="10" ry="10" fill="#313244"/>
  <rect x="0" y="${TITLE_H / 2}" width="${WIDTH}" height="${TITLE_H / 2}" fill="#313244"/>
  <!-- Traffic lights -->
  <circle cx="20" cy="${TITLE_H / 2}" r="6" fill="#ff5f57"/>
  <circle cx="40" cy="${TITLE_H / 2}" r="6" fill="#ffbd2e"/>
  <circle cx="60" cy="${TITLE_H / 2}" r="6" fill="#28c840"/>
  <!-- Window title -->
  <text x="${WIDTH / 2}" y="${TITLE_H / 2 + 5}" text-anchor="middle"
        font-family="'SF Mono', 'Fira Code', 'Menlo', monospace"
        font-size="13" fill="${dimColor}">${escapeXml(theme.name || theme.id || 'Terminal')}</text>`;

  // ── Terminal body ──────────────────────────────────────────────────────────
  const bodyY = TITLE_H;

  // Line 1: prompt + command
  const line1Y = bodyY + LINE_H * 1.4;
  const { svg: promptSvg, endX: promptEndX } = renderTokenLine(promptTokens, PAD_X, line1Y, FONT_SIZE);
  const cmdText = 'git status';
  const cmdSvg = `<tspan x="${promptEndX.toFixed(1)}" y="${line1Y}" fill="${textColor}">${escapeXml(cmdText)}</tspan>`;

  // Blinking cursor after command (static rectangle)
  const cursorX = promptEndX + measureText(cmdText, FONT_SIZE);
  const cursorSvg = `
  <rect x="${cursorX.toFixed(1)}" y="${(line1Y - FONT_SIZE + 2).toFixed(1)}"
        width="${(FONT_SIZE * 0.6).toFixed(1)}" height="${FONT_SIZE}"
        fill="${textColor}" opacity="0.7">
    <animate attributeName="opacity" values="0.7;0;0.7" dur="1.2s" repeatCount="indefinite"/>
  </rect>`;

  // Line 2: git status output
  const line2Y = line1Y + LINE_H;
  const gitOutput = [
    { text: 'On branch ', fg: textColor },
    { text: 'main', fg: '#89b4fa', bold: true },
  ];
  const { svg: gitLine1Svg } = renderTokenLine(gitOutput, PAD_X, line2Y, FONT_SIZE);

  // Line 3
  const line3Y = line2Y + LINE_H;
  const gitOutput2 = [
    { text: 'Changes not staged for commit:', fg: '#f38ba8' },
  ];
  const { svg: gitLine2Svg } = renderTokenLine(gitOutput2, PAD_X, line3Y, FONT_SIZE);

  // Line 4
  const line4Y = line3Y + LINE_H;
  const gitOutput3 = [
    { text: '  modified:   ', fg: dimColor },
    { text: 'src/parser.js', fg: '#a6e3a1' },
  ];
  const { svg: gitLine3Svg } = renderTokenLine(gitOutput3, PAD_X, line4Y, FONT_SIZE);

  // Line 5: second prompt (empty, with cursor)
  const line5Y = line4Y + LINE_H;
  const { svg: prompt2Svg, endX: prompt2EndX } = renderTokenLine(promptTokens, PAD_X, line5Y, FONT_SIZE);
  const cursor2Svg = `
  <rect x="${prompt2EndX.toFixed(1)}" y="${(line5Y - FONT_SIZE + 2).toFixed(1)}"
        width="${(FONT_SIZE * 0.6).toFixed(1)}" height="${FONT_SIZE}"
        fill="${textColor}" opacity="0.7">
    <animate attributeName="opacity" values="0.7;0;0.7" dur="1.2s" begin="0.6s" repeatCount="indefinite"/>
  </rect>`;

  // ── Shell name badge (bottom-right) ───────────────────────────────────────
  const shellBadge = theme.shell
    ? `<text x="${WIDTH - PAD_X}" y="${HEIGHT - 10}" text-anchor="end"
             font-family="'SF Mono', 'Fira Code', 'Menlo', monospace"
             font-size="11" fill="${dimColor}">${escapeXml(theme.shell)}</text>`
    : '';

  // ── Theme id badge (bottom-left) ──────────────────────────────────────────
  const idBadge = theme.id
    ? `<text x="${PAD_X}" y="${HEIGHT - 10}"
             font-family="'SF Mono', 'Fira Code', 'Menlo', monospace"
             font-size="11" fill="${dimColor}">${escapeXml(theme.id)}</text>`
    : '';

  // ── Assemble ───────────────────────────────────────────────────────────────
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"
     viewBox="0 0 ${WIDTH} ${HEIGHT}">

  <defs>
    <clipPath id="terminal-clip">
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="10" ry="10"/>
    </clipPath>
  </defs>

  <!-- Drop shadow -->
  <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
    <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/>
  </filter>

  <g clip-path="url(#terminal-clip)" filter="url(#shadow)">
    <!-- Background -->
    <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="${escapeXml(bg)}"/>

    <!-- Title bar -->
    ${titleBar}

    <!-- Scanline overlay (subtle texture) -->
    <rect x="0" y="${bodyY}" width="${WIDTH}" height="${HEIGHT - bodyY}"
          fill="url(#scanlines)" opacity="0.03"/>

    <!-- Terminal text -->
    <text font-family="'SF Mono', 'Fira Code', 'Menlo', 'Courier New', monospace"
          font-size="${FONT_SIZE}" letter-spacing="0.3">
      ${promptSvg}${cmdSvg}
      ${gitLine1Svg}
      ${gitLine2Svg}
      ${gitLine3Svg}
      ${prompt2Svg}
    </text>

    ${cursorSvg}
    ${cursor2Svg}

    ${shellBadge}
    ${idBadge}
  </g>
</svg>`;

  return svg;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate an SVG preview for a theme file.
 *
 * @param {string} themePath  - Absolute or relative path to the theme YAML
 * @param {string} [outputDir] - Directory to write SVG into (default: previews/{shell}/)
 * @returns {string} Absolute path of the written SVG file
 */
async function generatePreview(themePath, outputDir) {
  // Lazy-require parser so this module is usable even when parser is absent
  // (e.g. in unit tests that mock the theme object directly via generatePreviewFromTheme)
  const parserPath = path.resolve(__dirname, '../src/parser.js');
  const { parseThemeFile } = require(parserPath);

  const theme = await parseThemeFile(themePath);

  const svg = buildSVG(theme);

  const shell   = theme.shell || 'unknown';
  const themeId = theme.id    || path.basename(themePath, path.extname(themePath));

  const dir = outputDir || path.resolve(__dirname, '../previews', shell);
  fs.mkdirSync(dir, { recursive: true });

  const outFile = path.join(dir, `${themeId}.svg`);
  fs.writeFileSync(outFile, svg, 'utf8');

  return outFile;
}

/**
 * Generate an SVG preview directly from a parsed theme object (useful for testing).
 *
 * @param {object} theme
 * @param {string} outFile - Full output file path
 */
function generatePreviewFromTheme(theme, outFile) {
  const svg = buildSVG(theme);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, svg, 'utf8');
  return outFile;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node generate-preview.js <theme.yaml> [output-dir]');
    process.exit(1);
  }

  const [themePath, outputDir] = args;

  generatePreview(path.resolve(process.cwd(), themePath), outputDir)
    .then(outFile => {
      console.log(`SVG preview written → ${outFile}`);
    })
    .catch(err => {
      console.error('Error generating preview:', err.message);
      process.exit(1);
    });
}

module.exports = { generatePreview, generatePreviewFromTheme, buildSVG, parseStyle, ansi256ToHex };
