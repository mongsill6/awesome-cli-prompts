'use strict';

const path = require('path');
const os = require('os');

const { detectShell, getRcFilePath, getShellInfo } = require('../../src/utils/shell-detect');

describe('shell-detect', () => {
  describe('detectShell()', () => {
    let originalShell;

    beforeEach(() => {
      originalShell = process.env.SHELL;
    });

    afterEach(() => {
      if (originalShell === undefined) {
        delete process.env.SHELL;
      } else {
        process.env.SHELL = originalShell;
      }
    });

    test('returns "bash" when SHELL is /bin/bash', () => {
      process.env.SHELL = '/bin/bash';
      expect(detectShell()).toBe('bash');
    });

    test('returns "zsh" when SHELL is /usr/bin/zsh', () => {
      process.env.SHELL = '/usr/bin/zsh';
      expect(detectShell()).toBe('zsh');
    });

    test('returns "fish" when SHELL is /usr/bin/fish', () => {
      process.env.SHELL = '/usr/bin/fish';
      expect(detectShell()).toBe('fish');
    });

    test('defaults to "bash" when SHELL is undefined', () => {
      delete process.env.SHELL;
      // Also clear process.env['0'] to ensure clean fallback
      const original0 = process.env['0'];
      delete process.env['0'];

      expect(detectShell()).toBe('bash');

      if (original0 === undefined) {
        delete process.env['0'];
      } else {
        process.env['0'] = original0;
      }
    });
  });

  describe('getRcFilePath(shell)', () => {
    const home = os.homedir();

    test('returns ~/.bashrc for "bash"', () => {
      expect(getRcFilePath('bash')).toBe(path.join(home, '.bashrc'));
    });

    test('returns ~/.zshrc for "zsh"', () => {
      expect(getRcFilePath('zsh')).toBe(path.join(home, '.zshrc'));
    });

    test('returns ~/.config/fish/config.fish for "fish"', () => {
      expect(getRcFilePath('fish')).toBe(path.join(home, '.config', 'fish', 'config.fish'));
    });

    test('returns ~/.config/starship.toml for "starship"', () => {
      expect(getRcFilePath('starship')).toBe(path.join(home, '.config', 'starship.toml'));
    });

    test('falls back to ~/.bashrc for an unknown shell name', () => {
      expect(getRcFilePath('unknown-shell')).toBe(path.join(home, '.bashrc'));
    });
  });

  describe('getShellInfo()', () => {
    let originalShell;

    beforeEach(() => {
      originalShell = process.env.SHELL;
      process.env.SHELL = '/bin/bash';
    });

    afterEach(() => {
      if (originalShell === undefined) {
        delete process.env.SHELL;
      } else {
        process.env.SHELL = originalShell;
      }
    });

    test('returns an object with name, rcFile, and version properties', () => {
      const info = getShellInfo();

      expect(info).toBeInstanceOf(Object);
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('rcFile');
      expect(info).toHaveProperty('version');
    });

    test('name matches the detected shell', () => {
      process.env.SHELL = '/bin/bash';
      const info = getShellInfo();
      expect(info.name).toBe('bash');
    });

    test('rcFile is an absolute path string', () => {
      const info = getShellInfo();
      expect(typeof info.rcFile).toBe('string');
      expect(path.isAbsolute(info.rcFile)).toBe(true);
    });

    test('version is a non-empty string', () => {
      const info = getShellInfo();
      expect(typeof info.version).toBe('string');
      expect(info.version.length).toBeGreaterThan(0);
    });

    test('rcFile is consistent with getRcFilePath(name)', () => {
      const info = getShellInfo();
      expect(info.rcFile).toBe(getRcFilePath(info.name));
    });
  });
});
