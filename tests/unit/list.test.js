const fs = require('fs');
const path = require('path');
const list = require('../../src/commands/list');
const { parseThemeFile } = require('../../src/parser');

// Mock modules
jest.mock('fs');
jest.mock('../../src/parser');

describe('list command', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let originalExitCode;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Store original exitCode
    originalExitCode = process.exitCode;
    process.exitCode = 0;

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Restore original exitCode
    process.exitCode = originalExitCode;
  });

  describe('list() with no options', () => {
    it('should call console.log and output contains "Total:"', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['minimal-clean.yaml', 'dark-mode.yaml']);
      parseThemeFile.mockImplementation((filePath) => {
        const fileName = path.basename(filePath);
        if (fileName === 'minimal-clean.yaml') {
          return {
            id: 'minimal-clean',
            description: 'A clean minimal theme',
            tags: ['minimal', 'clean']
          };
        }
        return {
          id: 'dark-mode',
          description: 'Dark mode theme',
          tags: ['dark']
        };
      });

      // Execute
      await list();

      // Verify
      expect(consoleLogSpy).toHaveBeenCalled();
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('Total:');
    });
  });

  describe('list({ shell: "bash" })', () => {
    it('should output contains "BASH"', async () => {
      // Setup mocks to return different themes for different shells
      fs.existsSync.mockImplementation((dirPath) => {
        return dirPath.includes('bash') || dirPath.includes('zsh') || dirPath.includes('fish') || dirPath.includes('starship');
      });

      fs.readdirSync.mockImplementation((dirPath) => {
        if (dirPath.includes('bash')) {
          return ['bash-theme.yaml'];
        }
        return [];
      });

      parseThemeFile.mockReturnValue({
        id: 'bash-theme',
        description: 'Bash shell theme',
        tags: ['bash']
      });

      // Execute
      await list({ shell: 'bash' });

      // Verify
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('BASH');
    });

    it('should only process the specified shell category', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['theme.yaml']);
      parseThemeFile.mockReturnValue({
        id: 'theme-id',
        description: 'A theme',
        tags: []
      });

      // Execute
      await list({ shell: 'bash' });

      // Verify that fs.readdirSync was called with bash directory
      expect(fs.readdirSync).toHaveBeenCalledWith(
        expect.stringContaining('bash')
      );

      // Should not have called for other shells
      const calls = fs.readdirSync.mock.calls;
      expect(calls.length).toBe(1); // Only one shell category processed
    });
  });

  describe('list({ shell: "nonexistent" })', () => {
    it('should output contains "Total: 0"', async () => {
      // Setup mocks - directory doesn't exist
      fs.existsSync.mockReturnValue(false);

      // Execute
      await list({ shell: 'nonexistent' });

      // Verify
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('Total: 0');
    });

    it('should not call parseThemeFile for nonexistent shell', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(false);

      // Execute
      await list({ shell: 'nonexistent' });

      // Verify
      expect(parseThemeFile).not.toHaveBeenCalled();
    });
  });

  describe('list() shows theme ids in output', () => {
    it('should display theme id like "minimal-clean"', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['minimal-clean.yaml', 'solarized.yaml']);
      parseThemeFile.mockImplementation((filePath) => {
        const fileName = path.basename(filePath);
        if (fileName === 'minimal-clean.yaml') {
          return {
            id: 'minimal-clean',
            description: 'Clean and minimal theme',
            tags: []
          };
        }
        return {
          id: 'solarized',
          description: 'Solarized color scheme',
          tags: []
        };
      });

      // Execute
      await list();

      // Verify
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('minimal-clean');
      expect(allOutput).toContain('solarized');
    });

    it('should include theme descriptions in output', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['test-theme.yaml']);
      parseThemeFile.mockReturnValue({
        id: 'test-theme',
        description: 'This is a test theme description',
        tags: []
      });

      // Execute
      await list();

      // Verify
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('This is a test theme description');
    });
  });

  describe('list() with multiple themes', () => {
    it('should display correct total count', async () => {
      // Setup mocks to return themes from multiple shells
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockImplementation((dirPath) => {
        if (dirPath.includes('bash')) {
          return ['bash-theme-1.yaml', 'bash-theme-2.yaml'];
        }
        if (dirPath.includes('zsh')) {
          return ['zsh-theme-1.yaml'];
        }
        return [];
      });

      parseThemeFile.mockImplementation((filePath) => {
        const fileName = path.basename(filePath);
        return {
          id: fileName.replace('.yaml', ''),
          description: 'Test theme',
          tags: []
        };
      });

      // Execute
      await list();

      // Verify - total should be 3 (2 bash + 1 zsh)
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('Total: 3');
    });
  });

  describe('list() error handling', () => {
    it('should set process.exitCode to 1 on error', async () => {
      // Setup mock to throw error
      fs.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      // Execute
      await list();

      // Verify
      expect(process.exitCode).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorOutput = consoleErrorSpy.mock.calls[0][0];
      expect(errorOutput).toContain('Error listing themes');
    });

    it('should continue processing when a single theme file fails to parse', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['valid.yaml', 'invalid.yaml', 'valid2.yaml']);
      parseThemeFile.mockImplementation((filePath) => {
        const fileName = path.basename(filePath);
        if (fileName === 'invalid.yaml') {
          throw new Error('Invalid YAML');
        }
        return {
          id: fileName.replace('.yaml', ''),
          description: 'Valid theme',
          tags: []
        };
      });

      // Execute
      await list();

      // Verify - should still display valid themes and correct total
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('valid');
      expect(allOutput).toContain('valid2');
      expect(allOutput).toContain('Total: 8'); // 2 valid per shell x 4 shells
      expect(process.exitCode).toBe(0); // No error for single file failures
    });
  });

  describe('list() tags display', () => {
    it('should display tags for themes that have them', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['tagged-theme.yaml']);
      parseThemeFile.mockReturnValue({
        id: 'tagged-theme',
        description: 'A theme with tags',
        tags: ['minimal', 'dark', 'modern']
      });

      // Execute
      await list();

      // Verify
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('minimal');
      expect(allOutput).toContain('dark');
      expect(allOutput).toContain('modern');
    });

    it('should handle themes without tags', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['no-tags-theme.yaml']);
      parseThemeFile.mockReturnValue({
        id: 'no-tags-theme',
        description: 'Theme without tags',
        tags: undefined
      });

      // Execute
      await list();

      // Verify - should still display the theme
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('no-tags-theme');
      expect(allOutput).toContain('Theme without tags');
    });
  });

  describe('list() shell categories', () => {
    it('should process all shell categories when no shell option is provided', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockImplementation((dirPath) => {
        if (dirPath.includes('bash')) {
          return ['bash-theme.yaml'];
        }
        if (dirPath.includes('zsh')) {
          return ['zsh-theme.yaml'];
        }
        if (dirPath.includes('fish')) {
          return ['fish-theme.yaml'];
        }
        if (dirPath.includes('starship')) {
          return ['starship-theme.yaml'];
        }
        return [];
      });

      parseThemeFile.mockImplementation((filePath) => {
        const dir = path.dirname(filePath);
        const shellName = dir.split(path.sep).pop();
        return {
          id: `${shellName}-theme`,
          description: `${shellName} theme`,
          tags: []
        };
      });

      // Execute
      await list();

      // Verify - all shells should be displayed
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('BASH');
      expect(allOutput).toContain('ZSH');
      expect(allOutput).toContain('FISH');
      expect(allOutput).toContain('STARSHIP');
      expect(allOutput).toContain('Total: 4');
    });

    it('should skip shell directories that do not exist', async () => {
      // Setup mocks
      fs.existsSync.mockImplementation((dirPath) => {
        return dirPath.includes('bash'); // Only bash exists
      });
      fs.readdirSync.mockReturnValue(['bash-theme.yaml']);
      parseThemeFile.mockReturnValue({
        id: 'bash-theme',
        description: 'Bash theme',
        tags: []
      });

      // Execute
      await list();

      // Verify - only bash should be displayed
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('BASH');
      expect(allOutput).not.toContain('ZSH');
      expect(allOutput).not.toContain('FISH');
    });
  });

  describe('list() file filtering', () => {
    it('should only process .yaml files', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue([
        'theme.yaml',
        'readme.md',
        'data.json',
        'another-theme.yaml'
      ]);

      parseThemeFile.mockImplementation((filePath) => {
        return {
          id: path.basename(filePath).replace('.yaml', ''),
          description: 'Theme',
          tags: []
        };
      });

      // Execute
      await list();

      // Verify - only .yaml files should be parsed (2 per shell x 4 shells = 8)
      expect(parseThemeFile).toHaveBeenCalledTimes(8);
      expect(parseThemeFile).toHaveBeenCalledWith(expect.stringContaining('theme.yaml'));
      expect(parseThemeFile).toHaveBeenCalledWith(expect.stringContaining('another-theme.yaml'));
    });

    it('should skip directories with no .yaml files', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['readme.md', 'data.json']); // No yaml files

      // Execute
      await list();

      // Verify
      expect(parseThemeFile).not.toHaveBeenCalled();
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allOutput).toContain('Total: 0');
    });
  });
});
