const { validateTheme } = require('../../src/validator');

describe('Validator Module', () => {
  const validTheme = {
    name: 'Test Theme',
    id: 'test-theme',
    shell: 'bash',
    author: 'tester',
    description: 'A test theme',
    version: '1.0.0',
    prompt: { code: 'PS1="$ "' }
  };

  describe('validateTheme - Valid themes', () => {
    test('should validate a complete valid theme', () => {
      const result = validateTheme(validTheme);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate with all supported shell values', () => {
      const shells = ['bash', 'zsh', 'fish', 'starship'];

      shells.forEach(shell => {
        const theme = { ...validTheme, shell };
        const result = validateTheme(theme);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    test('should validate theme with additional optional fields', () => {
      const themeWithExtra = {
        ...validTheme,
        tags: ['minimal', 'clean'],
        requires: { nerd_font: false, tools: [] },
        colors: { primary: '#5fa4e6', secondary: '#e6a25f' },
        segments: [{ type: 'directory', style: '38;5;39' }]
      };

      const result = validateTheme(themeWithExtra);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should validate with complex version formats', () => {
      const versions = [
        '0.0.1',
        '1.0.0',
        '2.3.4',
        '10.20.30',
        '1.0.0-alpha',
        '1.0.0-beta.1',
        '1.0.0+build.123'
      ];

      versions.forEach(version => {
        const theme = { ...validTheme, version };
        const result = validateTheme(theme);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });
  });

  describe('validateTheme - Missing required fields', () => {
    test('should return error when "name" is missing', () => {
      const theme = { ...validTheme };
      delete theme.name;

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "name" is required and must be a non-empty string');
    });

    test('should return error when "name" is empty string', () => {
      const theme = { ...validTheme, name: '' };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "name" is required and must be a non-empty string');
    });

    test('should return error when "name" is only whitespace', () => {
      const theme = { ...validTheme, name: '   ' };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "name" is required and must be a non-empty string');
    });

    test('should return error when "name" is not a string', () => {
      const nonStringValues = [null, undefined, 123, true, {}, []];

      nonStringValues.forEach(value => {
        const theme = { ...validTheme, name: value };
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Field "name" is required and must be a non-empty string');
      });
    });

    test('should return error when "id" is missing', () => {
      const theme = { ...validTheme };
      delete theme.id;

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "id" is required and must be a non-empty string');
    });

    test('should return error when "author" is missing', () => {
      const theme = { ...validTheme };
      delete theme.author;

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "author" is required and must be a non-empty string');
    });

    test('should return error when "description" is missing', () => {
      const theme = { ...validTheme };
      delete theme.description;

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "description" is required and must be a non-empty string');
    });

    test('should return error when "version" is missing', () => {
      const theme = { ...validTheme };
      delete theme.version;

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "version" is required and must be a non-empty string');
    });

    test('should return error when "shell" is missing', () => {
      const theme = { ...validTheme };
      delete theme.shell;

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "shell" is required and must be a non-empty string');
    });

    test('should return error when "prompt" is missing', () => {
      const theme = { ...validTheme };
      delete theme.prompt;

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "prompt" is required and must be an object');
    });

    test('should return error when "prompt.code" is missing', () => {
      const theme = { ...validTheme, prompt: {} };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "prompt.code" is required and must be a non-empty string');
    });
  });

  describe('validateTheme - Invalid id format', () => {
    test('should reject id with uppercase letters', () => {
      const theme = { ...validTheme, id: 'Test-Theme' };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "id" must match pattern /^[a-z0-9-]+$/');
    });

    test('should reject id with spaces', () => {
      const theme = { ...validTheme, id: 'test theme' };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "id" must match pattern /^[a-z0-9-]+$/');
    });

    test('should reject id with special characters', () => {
      const invalidIds = [
        'test@theme',
        'test#theme',
        'test.theme',
        'test_theme',
        'test/theme',
        'test\\theme',
        'test|theme'
      ];

      invalidIds.forEach(id => {
        const theme = { ...validTheme, id };
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Field "id" must match pattern /^[a-z0-9-]+$/');
      });
    });

    test('should accept id with lowercase letters and numbers', () => {
      const validIds = [
        'test-theme',
        'test-theme-123',
        'theme123',
        'a',
        'z',
        '0',
        '9',
        'a-b-c-d-e'
      ];

      validIds.forEach(id => {
        const theme = { ...validTheme, id };
        const result = validateTheme(theme);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });
  });

  describe('validateTheme - Invalid shell value', () => {
    test('should reject invalid shell values', () => {
      const invalidShells = ['bash2', 'zshpro', 'powershell', 'cmd', 'sh', 'ksh', 'dash'];

      invalidShells.forEach(shell => {
        const theme = { ...validTheme, shell };
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`Field "shell" must be one of: bash, zsh, fish, starship`);
      });
    });

    test('should reject shell with wrong case', () => {
      const theme = { ...validTheme, shell: 'Bash' };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`Field "shell" must be one of: bash, zsh, fish, starship`);
    });

    test('should reject empty shell string', () => {
      const theme = { ...validTheme, shell: '' };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "shell" is required and must be a non-empty string');
    });
  });

  describe('validateTheme - Invalid version format', () => {
    test('should reject version without semver format', () => {
      const invalidVersions = ['1', '1.0', 'latest', 'v1.0.0', 'abc'];

      invalidVersions.forEach(version => {
        const theme = { ...validTheme, version };
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Field "version" must be semver-like format (e.g. "1.0.0")');
      });
    });

    test('should accept version starting with semver pattern (e.g. 1.0.0.0)', () => {
      // The regex is /^\d+\.\d+\.\d+/ so it matches at the start
      const theme = { ...validTheme, version: '1.0.0.0' };
      const result = validateTheme(theme);
      expect(result.valid).toBe(true);
    });

    test('should accept version with prerelease and metadata', () => {
      const validVersions = ['1.0.0-alpha', '2.1.0-beta.1', '1.2.3+build'];

      validVersions.forEach(version => {
        const theme = { ...validTheme, version };
        const result = validateTheme(theme);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateTheme - prompt.code validation', () => {
    test('should reject when prompt is not an object (null, string, number, boolean)', () => {
      const invalidPrompts = [
        null,
        undefined,
        'string',
        123,
        true
      ];

      invalidPrompts.forEach(prompt => {
        const theme = { ...validTheme, prompt };
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Field "prompt" is required and must be an object');
      });
    });

    test('should reject when prompt is array (arrays are objects but should have .code)', () => {
      // Arrays pass typeof check but fail on .code validation
      const theme = { ...validTheme, prompt: [] };
      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "prompt.code" is required and must be a non-empty string');
    });

    test('should reject when prompt.code is empty', () => {
      const theme = { ...validTheme, prompt: { code: '' } };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "prompt.code" is required and must be a non-empty string');
    });

    test('should reject when prompt.code is only whitespace', () => {
      const theme = { ...validTheme, prompt: { code: '   \n  ' } };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "prompt.code" is required and must be a non-empty string');
    });

    test('should accept prompt with additional fields', () => {
      const theme = {
        ...validTheme,
        prompt: {
          code: 'PS1="$ "',
          install_instructions: 'Add to bashrc',
          description: 'Custom prompt'
        }
      };

      const result = validateTheme(theme);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('validateTheme - Multiple errors', () => {
    test('should return multiple errors at once', () => {
      const theme = {
        name: '',
        id: 'Invalid ID With Spaces',
        shell: 'invalid-shell',
        author: '',
        description: '',
        version: 'not-semver',
        prompt: {}
      };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);

      // Check that multiple specific errors are present
      expect(result.errors).toContain('Field "name" is required and must be a non-empty string');
      expect(result.errors.some(e => e.includes('id') && e.includes('pattern'))).toBe(true);
      expect(result.errors).toContain(`Field "shell" must be one of: bash, zsh, fish, starship`);
    });

    test('should catch all missing required fields', () => {
      const theme = {};

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(7); // All 7 required fields missing

      expect(result.errors).toContain('Field "name" is required and must be a non-empty string');
      expect(result.errors).toContain('Field "id" is required and must be a non-empty string');
      expect(result.errors).toContain('Field "shell" is required and must be a non-empty string');
      expect(result.errors).toContain('Field "author" is required and must be a non-empty string');
      expect(result.errors).toContain('Field "description" is required and must be a non-empty string');
      expect(result.errors).toContain('Field "version" is required and must be a non-empty string');
      expect(result.errors).toContain('Field "prompt" is required and must be an object');
    });

    test('should accumulate errors correctly', () => {
      const theme = {
        name: '  ',
        id: 'test@invalid',
        shell: 'csh',
        author: null,
        description: undefined,
        version: '999',
        prompt: null
      };

      const result = validateTheme(theme);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });

  describe('validateTheme - Type checking', () => {
    test('should reject non-string types for string fields', () => {
      const nonStringTests = [
        { name: 123 },
        { name: true },
        { name: {} },
        { name: [] },
        { author: null },
        { author: undefined },
        { description: 123 }
      ];

      nonStringTests.forEach(override => {
        const theme = { ...validTheme, ...override };
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
      });
    });

    test('should handle prompt.code with non-string type', () => {
      const invalidPrompts = [
        { code: 123 },
        { code: true },
        { code: null },
        { code: [] }
      ];

      invalidPrompts.forEach(code => {
        const theme = { ...validTheme, prompt: code };
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateTheme - Edge cases', () => {
    test('should handle extra fields gracefully', () => {
      const themeWithExtra = {
        ...validTheme,
        unknown_field: 'should be ignored',
        another_extra: 123,
        custom_data: { nested: 'value' }
      };

      const result = validateTheme(themeWithExtra);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should handle very long string values', () => {
      const longString = 'a'.repeat(10000);
      const theme = {
        ...validTheme,
        description: longString,
        prompt: { code: longString }
      };

      const result = validateTheme(theme);
      expect(result.valid).toBe(true);
    });

    test('should handle themes with only required fields', () => {
      const minimalTheme = {
        name: 'Minimal',
        id: 'minimal',
        shell: 'bash',
        author: 'author',
        description: 'desc',
        version: '1.0.0',
        prompt: { code: 'code' }
      };

      const result = validateTheme(minimalTheme);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should return consistent error messages', () => {
      const theme1 = { ...validTheme, id: 'Invalid ID' };
      const theme2 = { ...validTheme, id: 'INVALID_ID' };

      const result1 = validateTheme(theme1);
      const result2 = validateTheme(theme2);

      // Both should have the same id error message
      expect(result1.errors.filter(e => e.includes('id'))[0]).toBe(
        result2.errors.filter(e => e.includes('id'))[0]
      );
    });
  });
});
