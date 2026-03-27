'use strict';

const fse = require('fs-extra');

const MARKER_START_PREFIX = '# >>> awesome-cli-prompts:';
const MARKER_END = '# <<< awesome-cli-prompts';

/**
 * Builds the start marker string for a given theme id.
 * @param {string} themeId
 * @returns {string}
 */
function buildStartMarker(themeId) {
  return `${MARKER_START_PREFIX} ${themeId}`;
}

/**
 * Checks whether the rc file contains an awesome-cli-prompts block.
 * @param {string} rcFilePath
 * @returns {boolean}
 */
function hasThemeBlock(rcFilePath) {
  if (!fse.pathExistsSync(rcFilePath)) return false;
  const content = fse.readFileSync(rcFilePath, 'utf8');
  return content.includes(MARKER_START_PREFIX) && content.includes(MARKER_END);
}

/**
 * Removes the awesome-cli-prompts marker block from the rc file content string.
 * Returns the cleaned content and the themeId that was removed (or null).
 * @param {string} content
 * @returns {{ cleaned: string, themeId: string|null }}
 */
function _stripBlock(content) {
  const startIndex = content.indexOf(MARKER_START_PREFIX);
  if (startIndex === -1) return { cleaned: content, themeId: null };

  const endIndex = content.indexOf(MARKER_END, startIndex);
  if (endIndex === -1) return { cleaned: content, themeId: null };

  // Extract themeId from the start marker line
  const startLineEnd = content.indexOf('\n', startIndex);
  const startLine = content.slice(startIndex, startLineEnd === -1 ? undefined : startLineEnd);
  const themeId = startLine.slice(MARKER_START_PREFIX.length).trim() || null;

  // Remove the block including surrounding newlines to avoid blank lines piling up
  const blockEnd = endIndex + MARKER_END.length;

  // Strip a leading newline before the block if present
  let from = startIndex;
  if (from > 0 && content[from - 1] === '\n') from -= 1;

  // Strip a trailing newline after the block if present
  let to = blockEnd;
  if (to < content.length && content[to] === '\n') to += 1;

  const cleaned = content.slice(0, from) + content.slice(to);
  return { cleaned, themeId };
}

/**
 * Removes the awesome-cli-prompts block from the given rc file.
 * @param {string} rcFilePath
 * @returns {{ success: boolean, themeId: string|null }}
 */
function removeThemeBlock(rcFilePath) {
  if (!fse.pathExistsSync(rcFilePath)) {
    return { success: false, themeId: null };
  }

  const content = fse.readFileSync(rcFilePath, 'utf8');
  const { cleaned, themeId } = _stripBlock(content);

  if (themeId === null) {
    return { success: false, themeId: null };
  }

  fse.writeFileSync(rcFilePath, cleaned, 'utf8');
  return { success: true, themeId };
}

/**
 * Inserts a theme block into the rc file, replacing any existing block.
 * Creates a .acp.bak backup on first run.
 * @param {string} rcFilePath
 * @param {string} themeId
 * @param {string} code - Shell code to inject
 * @returns {{ success: boolean, backupCreated: boolean, previousThemeRemoved: boolean }}
 */
function insertThemeBlock(rcFilePath, themeId, code) {
  // Ensure the rc file exists (create empty if not)
  fse.ensureFileSync(rcFilePath);

  const original = fse.readFileSync(rcFilePath, 'utf8');

  // Create backup if it does not already exist
  const backupPath = rcFilePath + '.acp.bak';
  const backupCreated = !fse.pathExistsSync(backupPath);
  if (backupCreated) {
    fse.copyFileSync(rcFilePath, backupPath);
  }

  // Remove existing block if present
  const { cleaned, themeId: removedId } = _stripBlock(original);
  const previousThemeRemoved = removedId !== null;

  // Append new block
  const startMarker = buildStartMarker(themeId);
  const block = `\n${startMarker}\n${code}\n${MARKER_END}\n`;
  const updated = cleaned.trimEnd() + block;

  fse.writeFileSync(rcFilePath, updated, 'utf8');

  return { success: true, backupCreated, previousThemeRemoved };
}

module.exports = { insertThemeBlock, removeThemeBlock, hasThemeBlock };
