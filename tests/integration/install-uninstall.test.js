'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// --- Mocks (declared before require of modules under test) ---

// Mock ora: return a fake spinner that does nothing
jest.mock('ora', () => {
  const spinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => spinner);
});

// Mock chalk: pass strings through unchanged so assertions on file content work
jest.mock('chalk', () => {
  const identity = (s) => s;
  const proxy = new Proxy(identity, {
    get: () => proxy,
    apply: (_, __, args) => args[0],
  });
  return proxy;
});

// We will mock os.homedir() per-test via jest.spyOn, so we need the real module
// available. The spy is set up in beforeEach below.

// ---------------------------------------------------------------

const install = require('../../src/commands/install');
const uninstall = require('../../src/commands/uninstall');

// --------------- helpers ----------------------------------------

/**
 * Create a minimal .bashrc-like rc file in the temp home directory.
 */
async function createRcFile(tmpHome, content = '# existing rc content\n') {
  const rcPath = path.join(tmpHome, '.bashrc');
  await fs.outputFile(rcPath, content, 'utf8');
  return rcPath;
}

// ---------------------------------------------------------------

describe('install / uninstall integration', () => {
  let tmpHome;
  let homedirSpy;
  let originalShell;

  beforeEach(async () => {
    // Create a fresh temporary home directory for each test
    tmpHome = await fs.mkdtemp(path.join(os.tmpdir(), 'acp-test-'));

    // Redirect os.homedir() to the temp directory
    homedirSpy = jest.spyOn(os, 'homedir').mockReturnValue(tmpHome);

    // Force bash shell detection
    originalShell = process.env.SHELL;
    process.env.SHELL = '/bin/bash';
  });

  afterEach(async () => {
    // Restore env and spy
    process.env.SHELL = originalShell;
    homedirSpy.mockRestore();

    // Remove the temp directory
    await fs.remove(tmpHome);
  });

  // ------------------------------------------------------------------
  // Test 1: Install a known theme — rc file contains markers and code
  // ------------------------------------------------------------------
  test('installs minimal-clean: rc file contains theme markers and prompt code', async () => {
    await createRcFile(tmpHome);
    const rcPath = path.join(tmpHome, '.bashrc');

    await install('minimal-clean', {});

    const content = await fs.readFile(rcPath, 'utf8');

    expect(content).toContain('# === awesome-cli-prompts: minimal-clean ===');
    expect(content).toContain('# === /awesome-cli-prompts ===');
    // The actual PS1 assignment from the theme file
    expect(content).toContain('PS1=');
  });

  // ------------------------------------------------------------------
  // Test 2: Install then uninstall — rc file is cleaned / restored
  // ------------------------------------------------------------------
  test('installs then uninstalls: rc file is restored to original content', async () => {
    const originalContent = '# original bashrc content\n';
    await createRcFile(tmpHome, originalContent);
    const rcPath = path.join(tmpHome, '.bashrc');
    const backupPath = `${rcPath}.acp.bak`;

    // Install creates a backup and appends the theme block
    await install('minimal-clean', {});

    // Confirm theme markers are present before uninstall
    const afterInstall = await fs.readFile(rcPath, 'utf8');
    expect(afterInstall).toContain('# === awesome-cli-prompts: minimal-clean ===');

    // Uninstall should restore from the .acp.bak backup
    expect(await fs.pathExists(backupPath)).toBe(true);
    await uninstall();

    const afterUninstall = await fs.readFile(rcPath, 'utf8');
    expect(afterUninstall).toBe(originalContent);
    // Backup file should be removed after restore
    expect(await fs.pathExists(backupPath)).toBe(false);
  });

  // ------------------------------------------------------------------
  // Test 3: Install creates .acp.bak backup file
  // ------------------------------------------------------------------
  test('install creates a .acp.bak backup of the rc file', async () => {
    const originalContent = '# my bashrc\nexport PATH="$PATH:/usr/local/bin"\n';
    await createRcFile(tmpHome, originalContent);
    const rcPath = path.join(tmpHome, '.bashrc');
    const backupPath = `${rcPath}.acp.bak`;

    expect(await fs.pathExists(backupPath)).toBe(false);

    await install('minimal-clean', {});

    expect(await fs.pathExists(backupPath)).toBe(true);
    const backupContent = await fs.readFile(backupPath, 'utf8');
    expect(backupContent).toBe(originalContent);
  });

  // ------------------------------------------------------------------
  // Test 4: Install unknown theme — does not crash, spinner shows error
  // ------------------------------------------------------------------
  test('installing an unknown theme does not throw and calls spinner.fail', async () => {
    await createRcFile(tmpHome);

    // Retrieve the ora mock so we can inspect calls
    const ora = require('ora');
    const spinnerInstance = ora();
    ora.mockClear();
    spinnerInstance.fail.mockClear();

    // Should resolve without throwing
    await expect(install('this-theme-does-not-exist', {})).resolves.toBeUndefined();

    // The spinner's fail method should have been called (theme not found)
    expect(spinnerInstance.fail).toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // Test 5: Double install (theme A then theme B) — both marker blocks present
  // ------------------------------------------------------------------
  test('double install appends both theme blocks when backup already exists', async () => {
    await createRcFile(tmpHome);
    const rcPath = path.join(tmpHome, '.bashrc');

    // Install first theme (minimal-clean — bash)
    await install('minimal-clean', {});

    // Install second theme (git-aware — bash)
    await install('git-aware', {});

    const content = await fs.readFile(rcPath, 'utf8');

    // install.js uses appendFile, so both blocks should be present
    expect(content).toContain('# === awesome-cli-prompts: minimal-clean ===');
    expect(content).toContain('# === awesome-cli-prompts: git-aware ===');
    // Both blocks are closed with the same end marker (appears at least twice)
    const endMarkerOccurrences = (content.match(/# === \/awesome-cli-prompts ===/g) || []).length;
    expect(endMarkerOccurrences).toBeGreaterThanOrEqual(2);

    // The backup should only have been created once (first install)
    const backupPath = `${rcPath}.acp.bak`;
    expect(await fs.pathExists(backupPath)).toBe(true);
  });
});
