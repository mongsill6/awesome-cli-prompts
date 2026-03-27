'use strict';

const path = require('path');
const os = require('os');
const fse = require('fs-extra');

// Mock ora BEFORE requiring uninstall
jest.mock('ora', () => {
  return jest.fn(() => {
    return {
      start: jest.fn(function() {
        return this;
      }),
      succeed: jest.fn(function() {
        return this;
      }),
      fail: jest.fn(function() {
        return this;
      }),
      warn: jest.fn(function() {
        return this;
      }),
    };
  });
});

const uninstall = require('../../src/commands/uninstall');
const ora = require('ora');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a unique temp directory for each test and returns helpers.
 */
function makeTempDir() {
  const dir = fse.mkdtempSync(path.join(os.tmpdir(), 'acp-uninstall-test-'));
  return {
    dir,
    filePath: (name = '.bashrc') => path.join(dir, name),
    cleanup: () => fse.removeSync(dir),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('uninstall command', () => {
  let originalShell;
  let originalHomedir;
  let consoleLogSpy;
  let oraInstance;

  beforeEach(() => {
    // Save original environment
    originalShell = process.env.SHELL;
    originalHomedir = os.homedir;

    // Clear console.log spy
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Clear ora mock calls
    ora.mockClear();
    oraInstance = {
      start: jest.fn(function() {
        return this;
      }),
      succeed: jest.fn(function() {
        return this;
      }),
      fail: jest.fn(function() {
        return this;
      }),
      warn: jest.fn(function() {
        return this;
      }),
    };
    ora.mockReturnValue(oraInstance);
  });

  afterEach(() => {
    // Restore original environment
    if (originalShell === undefined) {
      delete process.env.SHELL;
    } else {
      process.env.SHELL = originalShell;
    }
    os.homedir = originalHomedir;

    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  describe('when .acp.bak backup exists', () => {
    test('should restore backup and remove .acp.bak file', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');
        const backupFile = `${rcFile}.acp.bak`;

        // Create original rc file
        fse.writeFileSync(rcFile, '# original rc content\n', 'utf8');
        // Create backup file
        fse.writeFileSync(backupFile, '# backup content\n', 'utf8');

        // Mock os.homedir to return temp dir
        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        // Run uninstall
        await uninstall();

        // Verify backup was restored
        const restoredContent = fse.readFileSync(rcFile, 'utf8');
        expect(restoredContent).toBe('# backup content\n');

        // Verify backup file was removed
        expect(fse.pathExistsSync(backupFile)).toBe(false);

        // Verify ora was used
        expect(ora).toHaveBeenCalledWith('Restoring backup...');
        expect(oraInstance.start).toHaveBeenCalled();
        expect(oraInstance.succeed).toHaveBeenCalled();
      } finally {
        tmp.cleanup();
      }
    });

    test('should show success message after restoring backup', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');
        const backupFile = `${rcFile}.acp.bak`;

        fse.writeFileSync(rcFile, '# original\n', 'utf8');
        fse.writeFileSync(backupFile, '# backup\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        // Check that succeed was called (spinner success)
        expect(oraInstance.succeed).toHaveBeenCalled();
        const successCall = oraInstance.succeed.mock.calls[0][0];
        expect(successCall).toContain('Theme uninstalled');
        expect(successCall).toContain('restored from backup');
      } finally {
        tmp.cleanup();
      }
    });

    test('should handle backup restore errors gracefully', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');
        const backupFile = `${rcFile}.acp.bak`;

        fse.writeFileSync(backupFile, '# backup\n', 'utf8');
        // Do NOT create rcFile — will cause copy to fail

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        // Mock fs.copy to fail
        const originalCopy = fse.copy;
        fse.copy = jest.fn().mockRejectedValueOnce(new Error('Copy failed'));

        try {
          await uninstall();

          // Verify spinner.fail was called
          expect(oraInstance.fail).toHaveBeenCalled();
          const failCall = oraInstance.fail.mock.calls[0][0];
          expect(failCall).toContain('Failed to restore backup');
        } finally {
          fse.copy = originalCopy;
        }
      } finally {
        tmp.cleanup();
      }
    });
  });

  describe('when no backup but markers exist in rc file', () => {
    test('should strip marker block from rc file', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');

        // Create rc file with theme markers
        const content = [
          '# original content',
          '# === awesome-cli-prompts:',
          'PS1="$(__promptline_theme) $ "',
          '# === /awesome-cli-prompts ===',
          '# more content',
        ].join('\n');

        fse.writeFileSync(rcFile, content, 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        // Verify markers were removed
        const cleaned = fse.readFileSync(rcFile, 'utf8');
        expect(cleaned).not.toContain('# === awesome-cli-prompts:');
        expect(cleaned).not.toContain('# === /awesome-cli-prompts ===');
        expect(cleaned).toContain('# original content');
        expect(cleaned).toContain('# more content');
      } finally {
        tmp.cleanup();
      }
    });

    test('should preserve content before and after marker block', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');

        const content = [
          '# header',
          'export PATH=$PATH:/usr/local/bin',
          '# === awesome-cli-prompts:',
          'PS1="themed"',
          '# === /awesome-cli-prompts ===',
          'export EDITOR=vim',
          '# footer',
        ].join('\n');

        fse.writeFileSync(rcFile, content, 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        const cleaned = fse.readFileSync(rcFile, 'utf8');
        expect(cleaned).toContain('# header');
        expect(cleaned).toContain('export PATH=$PATH:/usr/local/bin');
        expect(cleaned).toContain('export EDITOR=vim');
        expect(cleaned).toContain('# footer');
      } finally {
        tmp.cleanup();
      }
    });

    test('should remove leading newline after marker block', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');

        // Content with newline after end marker
        const content = [
          '# before',
          '# === awesome-cli-prompts:',
          'PS1="test"',
          '# === /awesome-cli-prompts ===',
          '',
          '# after',
        ].join('\n');

        fse.writeFileSync(rcFile, content, 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        const cleaned = fse.readFileSync(rcFile, 'utf8');
        // Should not have double newline between before and after
        expect(cleaned).not.toMatch(/===.*\n\n# after/);
      } finally {
        tmp.cleanup();
      }
    });

    test('should print success message when markers are stripped', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');

        fse.writeFileSync(
          rcFile,
          '# === awesome-cli-prompts:\nPS1="test"\n# === /awesome-cli-prompts ===\n',
          'utf8'
        );

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        // console.log should be called with success message
        expect(consoleLogSpy).toHaveBeenCalled();
        const output = consoleLogSpy.mock.calls
          .map((args) => args.join(''))
          .join('\n');
        expect(output).toContain('Theme uninstalled');
        expect(output).toContain('RC file cleaned');
      } finally {
        tmp.cleanup();
      }
    });
  });

  describe('when no backup and no markers found', () => {
    test('should print "No awesome-cli-prompts theme found" message', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');

        // Create rc file without markers
        fse.writeFileSync(rcFile, '# some rc content\nexport VAR=value\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        // Verify console.log was called with appropriate message
        expect(consoleLogSpy).toHaveBeenCalled();
        const output = consoleLogSpy.mock.calls
          .map((args) => args.join(''))
          .join('\n');
        expect(output).toContain('No awesome-cli-prompts theme found');
      } finally {
        tmp.cleanup();
      }
    });

    test('should not modify the rc file when no markers are found', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');
        const originalContent = '# original content\nexport TEST=1\n';

        fse.writeFileSync(rcFile, originalContent, 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        const content = fse.readFileSync(rcFile, 'utf8');
        expect(content).toBe(originalContent);
      } finally {
        tmp.cleanup();
      }
    });
  });

  describe('when rc file does not exist and no backup', () => {
    test('should handle gracefully without crashing', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');
        // Do NOT create the file

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        // Should not throw
        await expect(uninstall()).resolves.not.toThrow();
      } finally {
        tmp.cleanup();
      }
    });

    test('should print error message when rc file does not exist', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');
        // Do NOT create the file

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        // Should log error about failed to clean rc file
        expect(consoleLogSpy).toHaveBeenCalled();
        const output = consoleLogSpy.mock.calls
          .map((args) => args.join(''))
          .join('\n');
        expect(output).toMatch(/Failed to clean RC file|ENOENT/);
      } finally {
        tmp.cleanup();
      }
    });
  });

  describe('shell detection', () => {
    test('should use bash rc file when SHELL is /bin/bash', async () => {
      const tmp = makeTempDir();
      try {
        const bashRc = tmp.filePath('.bashrc');
        fse.writeFileSync(bashRc, '# content\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        // Should have attempted to read .bashrc
        const content = fse.readFileSync(bashRc, 'utf8');
        expect(content).toBe('# content\n'); // File still exists, no markers to clean
      } finally {
        tmp.cleanup();
      }
    });

    test('should use zsh rc file when SHELL is /bin/zsh', async () => {
      const tmp = makeTempDir();
      try {
        const zshRc = tmp.filePath('.zshrc');
        fse.writeFileSync(zshRc, '# zsh content\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/zsh';

        await uninstall();

        // File should still exist (no markers to clean)
        expect(fse.pathExistsSync(zshRc)).toBe(true);
      } finally {
        tmp.cleanup();
      }
    });

    test('should use fish config file when SHELL is /bin/fish', async () => {
      const tmp = makeTempDir();
      try {
        const fishDir = path.join(tmp.dir, '.config', 'fish');
        const fishConfig = path.join(fishDir, 'config.fish');

        fse.ensureDirSync(fishDir);
        fse.writeFileSync(fishConfig, '# fish content\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/fish';

        await uninstall();

        expect(fse.pathExistsSync(fishConfig)).toBe(true);
      } finally {
        tmp.cleanup();
      }
    });

    test('should use starship config file when SHELL is /bin/starship', async () => {
      const tmp = makeTempDir();
      try {
        const configDir = path.join(tmp.dir, '.config');
        const starshipConfig = path.join(configDir, 'starship.toml');

        fse.ensureDirSync(configDir);
        fse.writeFileSync(starshipConfig, '# starship content\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/starship';

        await uninstall();

        expect(fse.pathExistsSync(starshipConfig)).toBe(true);
      } finally {
        tmp.cleanup();
      }
    });

    test('should default to bash when SHELL is not set', async () => {
      const tmp = makeTempDir();
      try {
        const bashRc = tmp.filePath('.bashrc');
        fse.writeFileSync(bashRc, '# default bash\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        delete process.env.SHELL;

        await uninstall();

        // Should have used .bashrc
        expect(fse.pathExistsSync(bashRc)).toBe(true);
      } finally {
        tmp.cleanup();
      }
    });
  });

  describe('error handling', () => {
    test('should catch and log errors from fs operations', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');

        // Create backup file to trigger restoration path
        fse.writeFileSync(`${rcFile}.acp.bak`, '# backup\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        // Mock fs.copy to throw error
        const originalCopy = fse.copy;
        fse.copy = jest
          .fn()
          .mockRejectedValueOnce(new Error('Disk error'));

        try {
          await uninstall();

          // Should have logged the error
          expect(oraInstance.fail).toHaveBeenCalled();
        } finally {
          fse.copy = originalCopy;
        }
      } finally {
        tmp.cleanup();
      }
    });

    test('should catch and log errors when reading rc file', async () => {
      const tmp = makeTempDir();
      try {
        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        // Mock fs.readFile to throw error
        const originalRead = fse.readFile;
        fse.readFile = jest
          .fn()
          .mockRejectedValueOnce(new Error('Permission denied'));

        try {
          await uninstall();

          // Should have logged the error
          expect(consoleLogSpy).toHaveBeenCalled();
          const output = consoleLogSpy.mock.calls
            .map((args) => args.join(''))
            .join('\n');
          expect(output).toContain('Failed to clean RC file');
        } finally {
          fse.readFile = originalRead;
        }
      } finally {
        tmp.cleanup();
      }
    });
  });

  describe('marker block detection', () => {
    test('should detect markers anywhere in the file', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');

        const content = [
          '# various settings',
          'export VAR1=value1',
          '',
          '# === awesome-cli-prompts:',
          'PS1="themed"',
          '# === /awesome-cli-prompts ===',
          '',
          'export VAR2=value2',
        ].join('\n');

        fse.writeFileSync(rcFile, content, 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        const cleaned = fse.readFileSync(rcFile, 'utf8');
        expect(cleaned).toContain('VAR1=value1');
        expect(cleaned).toContain('VAR2=value2');
        expect(cleaned).not.toContain('awesome-cli-prompts');
      } finally {
        tmp.cleanup();
      }
    });

    test('should only match exact marker strings', async () => {
      const tmp = makeTempDir();
      try {
        const rcFile = tmp.filePath('.bashrc');

        // Content with similar but non-matching markers
        const content = [
          '# === awesome-cli-prompts setup',
          'PS1="test"',
          '# === /awesome-cli-prompts config',
        ].join('\n');

        fse.writeFileSync(rcFile, content, 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/bash';

        await uninstall();

        // Should NOT be removed because markers don't match exactly
        const cleaned = fse.readFileSync(rcFile, 'utf8');
        expect(cleaned).toBe(content);
      } finally {
        tmp.cleanup();
      }
    });
  });

  describe('multiple shells integration', () => {
    test('should handle zsh with markers correctly', async () => {
      const tmp = makeTempDir();
      try {
        const zshRc = tmp.filePath('.zshrc');

        const content = [
          'setopt HIST_FIND_NO_DUPS',
          '# === awesome-cli-prompts:',
          'PS1="$PROMPT"',
          '# === /awesome-cli-prompts ===',
          'setopt SHARE_HISTORY',
        ].join('\n');

        fse.writeFileSync(zshRc, content, 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/zsh';

        await uninstall();

        const cleaned = fse.readFileSync(zshRc, 'utf8');
        expect(cleaned).toContain('HIST_FIND_NO_DUPS');
        expect(cleaned).toContain('SHARE_HISTORY');
        expect(cleaned).not.toContain('awesome-cli-prompts');
      } finally {
        tmp.cleanup();
      }
    });

    test('should handle fish with backup correctly', async () => {
      const tmp = makeTempDir();
      try {
        const fishDir = path.join(tmp.dir, '.config', 'fish');
        const fishConfig = path.join(fishDir, 'config.fish');
        const backupFile = `${fishConfig}.acp.bak`;

        fse.ensureDirSync(fishDir);
        fse.writeFileSync(fishConfig, '# current config\n', 'utf8');
        fse.writeFileSync(backupFile, '# original config\n', 'utf8');

        os.homedir = jest.fn(() => tmp.dir);
        process.env.SHELL = '/bin/fish';

        await uninstall();

        const restored = fse.readFileSync(fishConfig, 'utf8');
        expect(restored).toBe('# original config\n');
        expect(fse.pathExistsSync(backupFile)).toBe(false);
      } finally {
        tmp.cleanup();
      }
    });
  });
});
