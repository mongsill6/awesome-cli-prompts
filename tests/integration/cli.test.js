'use strict';

const { execSync } = require('child_process');

const CWD = '/tmp/awesome-cli-prompts/';
const EXEC_OPTS = { cwd: CWD, encoding: 'utf8' };
const TIMEOUT = 10000;

function run(args) {
  return execSync(`node src/cli.js ${args}`, { ...EXEC_OPTS, timeout: TIMEOUT });
}

function runExpectFailure(args) {
  try {
    execSync(`node src/cli.js ${args}`, { ...EXEC_OPTS, timeout: TIMEOUT });
    return { stdout: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status,
    };
  }
}

describe('CLI integration tests', () => {
  describe('list command', () => {
    test('list — exit code 0, output contains "Total:" and a theme count', () => {
      const output = run('list');
      expect(output).toMatch(/Total:/);
      expect(output).toMatch(/Total:\s*\d+/);
    });

    test('list --shell bash — output contains "BASH"', () => {
      const output = run('list --shell bash');
      expect(output).toMatch(/BASH/);
    });

    test('list --shell nonexistent — exit code 0, output contains "Total: 0"', () => {
      const output = run('list --shell nonexistent');
      expect(output).toMatch(/Total:\s*0/);
    });
  });

  describe('search command', () => {
    test('search minimal — exit code 0, output contains "minimal-clean"', () => {
      const output = run('search minimal');
      expect(output).toMatch(/minimal-clean/);
    });

    test('search zzzznotfound — exit code 0, output contains "No themes matched"', () => {
      const output = run('search zzzznotfound');
      expect(output).toMatch(/No themes matched/);
    });

    test('search minimal --shell bash — output contains "minimal-clean"', () => {
      const output = run('search minimal --shell bash');
      expect(output).toMatch(/minimal-clean/);
    });

    test('search minimal --limit 1 — only 1 result block', () => {
      const output = run('search minimal --limit 1');
      // With --limit 1, only one "Match score:" line should appear
      const matchScoreOccurrences = (output.match(/Match score/g) || []).length;
      expect(matchScoreOccurrences).toBe(1);
    });
  });

  describe('info command', () => {
    test('info minimal-clean — exit code 0, output contains theme metadata', () => {
      const output = run('info minimal-clean');
      expect(output).toMatch(/minimal-clean/i);
    });

    test('info nonexistent-theme — exit code 1', () => {
      const result = runExpectFailure('info nonexistent-theme');
      expect(result.exitCode).toBe(1);
    });
  });

  describe('help / no args', () => {
    test('no args — output contains "awesome-cli-prompts"', () => {
      // Running with no args should print help; commander may exit 0 or non-zero.
      let output = '';
      try {
        output = run('');
      } catch (err) {
        output = err.stdout || err.stderr || '';
      }
      expect(output).toMatch(/awesome-cli-prompts/);
    });

    test('--help — output contains "Usage"', () => {
      let output = '';
      try {
        output = run('--help');
      } catch (err) {
        output = err.stdout || err.stderr || '';
      }
      expect(output).toMatch(/Usage/);
    });
  });
});
