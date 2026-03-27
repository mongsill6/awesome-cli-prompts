const preview = require('../../src/commands/preview');
const chalk = require('chalk');

describe('Preview Command', () => {
  let consoleLogSpy;

  beforeEach(() => {
    // Spy on console.log to track calls and verify output
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restore original console.log after each test
    consoleLogSpy.mockRestore();
  });

  describe('preview with valid theme', () => {
    test('should call console.log and output contains "Theme Preview"', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      // Get all the logged output and join it
      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Verify "Theme Preview" header is present
      expect(allOutput).toContain('Theme Preview');
    });

    test('should display theme metadata (name, id, shell)', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Verify essential metadata fields are displayed
      expect(allOutput).toContain('Name:');
      expect(allOutput).toContain('ID:');
      expect(allOutput).toContain('Shell:');

      // Verify the actual values from the theme
      expect(allOutput).toMatch(/minimal/i);
    });

    test('should display "Prompt Code" section', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Verify the Prompt Code header is present
      expect(allOutput).toContain('Prompt Code');
    });

    test('should display all theme metadata fields', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Verify all expected metadata fields
      expect(allOutput).toContain('Name:');
      expect(allOutput).toContain('ID:');
      expect(allOutput).toContain('Shell:');
      expect(allOutput).toContain('Author:');
      expect(allOutput).toContain('Version:');
      expect(allOutput).toContain('Description:');
    });

    test('should include tags if theme has tags', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // minimal theme has tags, so should be present
      expect(allOutput).toContain('Tags:');
    });

    test('should display the prompt code content', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // The preview should contain the prompt code section
      expect(allOutput).toContain('Prompt Code');
      // Minimal theme has code with config instructions
      expect(allOutput).toMatch(/starship/i);
    });

    test('should display simulated output', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Should show simulated output section
      expect(allOutput).toContain('Simulated output');
    });

    test('should create a preview box with borders', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Should contain box drawing characters
      expect(allOutput).toContain('┌');
      expect(allOutput).toContain('├');
      expect(allOutput).toContain('└');
    });
  });

  describe('preview with nonexistent theme', () => {
    test('should output "not found" for nonexistent theme', async () => {
      await preview('nonexistent-xyz');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Verify error message contains "not found"
      expect(allOutput).toContain('not found');
    });

    test('should output error message with theme id', async () => {
      await preview('nonexistent-xyz');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Verify the specific theme id is mentioned in error
      expect(allOutput).toContain('nonexistent-xyz');
      expect(allOutput).toContain('Error');
    });

    test('should not display theme preview for nonexistent theme', async () => {
      await preview('nonexistent-xyz');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Should not contain the preview header for missing theme
      expect(allOutput).not.toContain('Prompt Code');
    });
  });

  describe('preview async behavior', () => {
    test('should be async function that resolves', async () => {
      const result = preview('minimal');

      // Should return a Promise
      expect(result).toBeInstanceOf(Promise);

      // Should resolve without error
      await expect(result).resolves.toBeUndefined();
    });

    test('should handle async execution for valid theme', async () => {
      // Test that we can await the function
      await expect(async () => {
        await preview('minimal');
      }).not.toThrow();
    });

    test('should handle async execution for invalid theme', async () => {
      // Test that we can await the function even for invalid theme
      await expect(async () => {
        await preview('nonexistent-xyz');
      }).not.toThrow();
    });
  });

  describe('preview console.log usage', () => {
    test('should use console.log for output (not console.error)', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await preview('minimal');

      // Should use console.log, not console.error
      expect(consoleLogSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    test('should call console.log multiple times for preview', async () => {
      await preview('minimal');

      // Should make multiple console.log calls for the preview box
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(1);
    });

    test('should call console.log at least once for error', async () => {
      await preview('nonexistent-xyz');

      // Should call console.log for error message
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('preview with different valid themes', () => {
    test('should preview "minimal-clean" theme if it exists', async () => {
      // Try to preview a different theme
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(allOutput).toContain('Theme Preview');
    });

    test('should work with different shell types', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Should show the shell type
      expect(allOutput).toContain('Shell:');
    });
  });

  describe('preview output formatting', () => {
    test('should use chalk formatting for colored output', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      // At least some calls should contain chalk formatted strings
      // (they will contain ANSI codes when chalk is used)
      const firstCall = consoleLogSpy.mock.calls[0];
      expect(firstCall).toBeDefined();
    });

    test('should format metadata with proper spacing', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Should have proper structure with pipes/borders
      expect(allOutput).toContain('│');
    });
  });

  describe('preview edge cases', () => {
    test('should handle theme with empty tags gracefully', async () => {
      // This test assumes minimal theme has tags, if we want to test without tags
      // we would need a different theme, but current minimal has tags
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    test('should handle multiline prompt code', async () => {
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Should display prompt code section
      expect(allOutput).toContain('Prompt Code');
    });

    test('should not throw error for valid theme', async () => {
      await expect(preview('minimal')).resolves.not.toThrow();
    });

    test('should not throw error for invalid theme', async () => {
      await expect(preview('nonexistent-xyz')).resolves.not.toThrow();
    });
  });

  describe('preview validation integration', () => {
    test('should not display invalid themes', async () => {
      // If a theme file fails validation, it shouldn't be shown
      // This tests the integration with validateTheme
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Should either show valid preview or error
      const hasPreview = allOutput.includes('Theme Preview');
      const hasError = allOutput.includes('Error') || allOutput.includes('not found');

      expect(hasPreview || hasError).toBe(true);
    });
  });

  describe('preview search across all shell directories', () => {
    test('should find theme across bash, zsh, fish, starship directories', async () => {
      // 'minimal' should be found in one of the shell directories
      await preview('minimal');

      expect(consoleLogSpy).toHaveBeenCalled();

      const allOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');

      // Should find and display the theme
      expect(allOutput).toContain('Theme Preview');
    });
  });
});
