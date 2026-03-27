'use strict';

const info = require('../../src/commands/info');

describe('info command', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let exitSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    exitSpy.mockRestore();
  });

  describe('known theme', () => {
    test('should display info card for a known theme id', () => {
      expect(() => info('minimal-clean')).not.toThrow();

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map(args => args.join('')).join('\n');

      // The card should contain the theme name and id
      expect(output).toContain('minimal-clean');
      // Card borders
      expect(output).toContain('┌');
      expect(output).toContain('└');
    });

    test('should include theme metadata fields in the output', () => {
      info('minimal-clean');

      const output = consoleLogSpy.mock.calls.map(args => args.join('')).join('\n');

      // Should include key labels from the card
      expect(output).toContain('Shell');
      expect(output).toContain('Author');
      expect(output).toContain('Version');
    });

    test('should not call process.exit for a valid theme', () => {
      info('minimal-clean');
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe('unknown theme', () => {
    test('should call process.exit(1) for an unknown theme id', () => {
      expect(() => info('this-theme-does-not-exist-xyz')).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('should print an error message for an unknown theme id', () => {
      expect(() => info('nonexistent-theme-abc')).toThrow('process.exit called');

      const errorOutput = consoleErrorSpy.mock.calls.map(args => args.join('')).join('\n');
      expect(errorOutput).toContain('nonexistent-theme-abc');
    });
  });

  describe('missing argument', () => {
    test('should call process.exit(1) when no themeId is provided', () => {
      expect(() => info()).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('should call process.exit(1) when themeId is undefined', () => {
      expect(() => info(undefined)).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('should call process.exit(1) when themeId is null', () => {
      expect(() => info(null)).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('should print usage hint when no themeId is provided', () => {
      expect(() => info()).toThrow('process.exit called');

      const errorOutput = consoleErrorSpy.mock.calls.map(args => args.join('')).join('\n');
      expect(errorOutput).toMatch(/required|Usage/i);
    });
  });
});
