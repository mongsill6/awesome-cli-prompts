'use strict';

const path = require('path');
const os = require('os');
const fse = require('fs-extra');

const { insertThemeBlock, removeThemeBlock, hasThemeBlock } = require('../../src/utils/config-merge');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a unique temp directory for each test and returns helpers to clean up.
 */
function makeTempDir() {
  const dir = fse.mkdtempSync(path.join(os.tmpdir(), 'acp-test-'));
  return {
    dir,
    filePath: (name = 'testrc') => path.join(dir, name),
    cleanup: () => fse.removeSync(dir),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('config-merge', () => {
  describe('insertThemeBlock()', () => {
    test('creates a block with the correct start and end markers', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '# existing content\n', 'utf8');

        insertThemeBlock(rc, 'my-theme', 'PS1="custom $ "');

        const content = fse.readFileSync(rc, 'utf8');
        expect(content).toContain('# >>> awesome-cli-prompts: my-theme');
        expect(content).toContain('PS1="custom $ "');
        expect(content).toContain('# <<< awesome-cli-prompts');
      } finally {
        tmp.cleanup();
      }
    });

    test('creates a .acp.bak backup file on first insertion', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '# original\n', 'utf8');

        const result = insertThemeBlock(rc, 'my-theme', 'PS1="$ "');

        expect(result.backupCreated).toBe(true);
        expect(fse.pathExistsSync(rc + '.acp.bak')).toBe(true);
        // Backup should hold the original content
        const backup = fse.readFileSync(rc + '.acp.bak', 'utf8');
        expect(backup).toBe('# original\n');
      } finally {
        tmp.cleanup();
      }
    });

    test('does not overwrite an existing .acp.bak on subsequent insertions', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '# original\n', 'utf8');

        // First insert — creates backup
        insertThemeBlock(rc, 'theme-a', 'PS1="A"');

        // Second insert — backup must NOT be overwritten
        const result = insertThemeBlock(rc, 'theme-b', 'PS1="B"');

        expect(result.backupCreated).toBe(false);
        // The backup still contains the very first content
        const backup = fse.readFileSync(rc + '.acp.bak', 'utf8');
        expect(backup).toBe('# original\n');
      } finally {
        tmp.cleanup();
      }
    });

    test('replaces an existing block when inserting a new one', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '# existing content\n', 'utf8');

        insertThemeBlock(rc, 'theme-a', 'PS1="A"');
        const result = insertThemeBlock(rc, 'theme-b', 'PS1="B"');

        expect(result.previousThemeRemoved).toBe(true);

        const content = fse.readFileSync(rc, 'utf8');
        // New theme present
        expect(content).toContain('# >>> awesome-cli-prompts: theme-b');
        expect(content).toContain('PS1="B"');
        // Old theme absent
        expect(content).not.toContain('# >>> awesome-cli-prompts: theme-a');
        expect(content).not.toContain('PS1="A"');
      } finally {
        tmp.cleanup();
      }
    });

    test('creates the rc file if it does not exist yet', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath('new-rc');
        expect(fse.pathExistsSync(rc)).toBe(false);

        const result = insertThemeBlock(rc, 'new-theme', 'PS1="new"');

        expect(result.success).toBe(true);
        expect(fse.pathExistsSync(rc)).toBe(true);
        expect(fse.readFileSync(rc, 'utf8')).toContain('# >>> awesome-cli-prompts: new-theme');
      } finally {
        tmp.cleanup();
      }
    });
  });

  describe('removeThemeBlock()', () => {
    test('removes an existing block and returns the themeId', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '# before\n', 'utf8');
        insertThemeBlock(rc, 'remove-me', 'PS1="bye"');

        const result = removeThemeBlock(rc);

        expect(result.success).toBe(true);
        expect(result.themeId).toBe('remove-me');

        const content = fse.readFileSync(rc, 'utf8');
        expect(content).not.toContain('# >>> awesome-cli-prompts:');
        expect(content).not.toContain('# <<< awesome-cli-prompts');
        expect(content).not.toContain('PS1="bye"');
      } finally {
        tmp.cleanup();
      }
    });

    test('returns { success: false, themeId: null } when no block exists', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '# just a normal rc file\n', 'utf8');

        const result = removeThemeBlock(rc);

        expect(result.success).toBe(false);
        expect(result.themeId).toBeNull();
      } finally {
        tmp.cleanup();
      }
    });

    test('returns { success: false } when the file does not exist', () => {
      const rc = path.join(os.tmpdir(), 'acp-nonexistent-' + Date.now() + '.rc');
      expect(fse.pathExistsSync(rc)).toBe(false);

      const result = removeThemeBlock(rc);

      expect(result.success).toBe(false);
      expect(result.themeId).toBeNull();
    });
  });

  describe('hasThemeBlock()', () => {
    test('returns true when a theme block is present', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '', 'utf8');
        insertThemeBlock(rc, 'detect-me', 'PS1="x"');

        expect(hasThemeBlock(rc)).toBe(true);
      } finally {
        tmp.cleanup();
      }
    });

    test('returns false when no theme block is present', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '# plain rc file\nexport FOO=bar\n', 'utf8');

        expect(hasThemeBlock(rc)).toBe(false);
      } finally {
        tmp.cleanup();
      }
    });

    test('returns false for a nonexistent file', () => {
      const rc = path.join(os.tmpdir(), 'acp-missing-' + Date.now() + '.rc');
      expect(fse.pathExistsSync(rc)).toBe(false);

      expect(hasThemeBlock(rc)).toBe(false);
    });

    test('returns false after a block has been removed', () => {
      const tmp = makeTempDir();
      try {
        const rc = tmp.filePath();
        fse.writeFileSync(rc, '', 'utf8');
        insertThemeBlock(rc, 'temp-theme', 'PS1="t"');
        removeThemeBlock(rc);

        expect(hasThemeBlock(rc)).toBe(false);
      } finally {
        tmp.cleanup();
      }
    });
  });
});
