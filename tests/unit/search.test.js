'use strict';

const search = require('../../src/commands/search');

describe('search command', () => {
  let consoleSpy;
  let consoleErrorSpy;
  let exitSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  describe('name-based search', () => {
    test('should find themes matching by name', () => {
      search('minimal', {});

      const allOutput = consoleSpy.mock.calls.map(args => args.join(' ')).join('\n');
      expect(allOutput).toContain('minimal-clean');
    });
  });

  describe('tag-based search', () => {
    test('should find themes matching by tag', () => {
      // git-aware.yaml in bash has tags: git, branch, status, developer, vcs
      search('vcs', {});

      const allOutput = consoleSpy.mock.calls.map(args => args.join(' ')).join('\n');
      // At least one result should be printed (results header or theme id)
      expect(consoleSpy).toHaveBeenCalled();
      // Should not show "No themes matched"
      const noMatch = consoleSpy.mock.calls.some(args =>
        args.join(' ').includes('No themes matched')
      );
      expect(noMatch).toBe(false);
    });
  });

  describe('--shell filter', () => {
    test('should only return results for the specified shell', () => {
      search('minimal', { shell: 'bash' });

      const allOutput = consoleSpy.mock.calls.map(args => args.join(' ')).join('\n');
      // minimal-clean is a bash theme and must appear
      expect(allOutput).toContain('minimal-clean');
      // fish-only themes should not appear
      expect(allOutput).not.toContain('[zsh]');
      expect(allOutput).not.toContain('[fish]');
      expect(allOutput).not.toContain('[starship]');
    });

    test('should return no results when shell filter excludes all matches', () => {
      // minimal-clean exists only in bash; searching in starship should not find it
      search('minimal-clean', { shell: 'starship' });

      const allOutput = consoleSpy.mock.calls.map(args => args.join(' ')).join('\n');
      // starship/minimal.yaml exists but not minimal-clean in starship
      // Either no results or results without bash items
      expect(allOutput).not.toContain('[bash]');
    });
  });

  describe('--limit option', () => {
    test('should respect the --limit option and return at most N results', () => {
      // Search broadly so there are many potential matches, then cap at 2
      search('a', { limit: 2 });

      // Count how many result blocks were printed. Each result ends with an empty
      // console.log() call (the blank spacer line after each item).
      // The first call is the header line, so we count blank lines after it.
      const blankLines = consoleSpy.mock.calls.filter(args => args[0] === undefined || args[0] === '').length;
      // We may also detect via "Match score" appearances
      const matchScoreLines = consoleSpy.mock.calls.filter(args =>
        args.join('').includes('Match score')
      ).length;

      expect(matchScoreLines).toBeLessThanOrEqual(2);
    });
  });

  describe('no results', () => {
    test('should handle no results gracefully without throwing', () => {
      expect(() => {
        search('zzzzzzzzzzzznotarealtheme99999', {});
      }).not.toThrow();

      const allOutput = consoleSpy.mock.calls.map(args => args.join(' ')).join('\n');
      expect(allOutput).toContain('No themes matched');
    });
  });

  describe('empty query', () => {
    test('should call process.exit(1) when query is empty string', () => {
      expect(() => search('', {})).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('should call process.exit(1) when query is whitespace only', () => {
      expect(() => search('   ', {})).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('should call process.exit(1) when query is undefined/null', () => {
      expect(() => search(undefined, {})).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockClear();

      expect(() => search(null, {})).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
