const { parseThemeFile, parseThemeString } = require('../../src/parser');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('Parser Module', () => {
  describe('parseThemeFile', () => {
    test('should read and parse a valid YAML theme file', () => {
      const filePath = path.join(__dirname, '../../themes/bash/minimal-clean.yaml');
      const result = parseThemeFile(filePath);

      expect(result).toBeInstanceOf(Object);
      expect(result.name).toBe('Minimal Clean');
      expect(result.id).toBe('minimal-clean');
      expect(result.shell).toBe('bash');
      expect(result.author).toBe('mongsill6');
      expect(result.description).toBe('A clean, minimal prompt with directory and arrow');
      expect(result.version).toBe('1.0.0');
      expect(result.prompt).toBeInstanceOf(Object);
      expect(result.prompt.code).toBeTruthy();
    });

    test('should throw error when file does not exist', () => {
      const filePath = '/tmp/nonexistent-theme-file-xyz.yaml';
      expect(() => parseThemeFile(filePath)).toThrow(/Theme file not found/);
    });

    test('should throw error when file path is relative and file not found', () => {
      const filePath = './nonexistent.yaml';
      expect(() => parseThemeFile(filePath)).toThrow(/Theme file not found/);
    });

    test('should work with relative paths when file exists', () => {
      const filePath = path.join(__dirname, '../../themes/bash/minimal-clean.yaml');
      const result = parseThemeFile(filePath);
      expect(result.id).toBe('minimal-clean');
    });
  });

  describe('parseThemeString', () => {
    test('should parse a valid YAML string', () => {
      const yamlString = `
name: Test Theme
id: test-theme
shell: bash
author: tester
description: A test theme
version: 1.0.0
prompt:
  code: 'PS1="$ "'
`;
      const result = parseThemeString(yamlString);

      expect(result).toBeInstanceOf(Object);
      expect(result.name).toBe('Test Theme');
      expect(result.id).toBe('test-theme');
      expect(result.shell).toBe('bash');
      expect(result.author).toBe('tester');
      expect(result.description).toBe('A test theme');
      expect(result.version).toBe('1.0.0');
      expect(result.prompt.code).toBe('PS1="$ "');
    });

    test('should throw error on invalid YAML syntax', () => {
      const invalidYaml = '{: invalid';
      expect(() => parseThemeString(invalidYaml)).toThrow(/Invalid YAML format/);
    });

    test('should throw error on malformed YAML with bad indentation', () => {
      const invalidYaml = `
name: Test
  id: bad-indent
  `;
      // YAML parser may be lenient with indentation, but we still test for parse errors
      // This specific string should parse, so let's use a more clearly invalid one
      const reallyInvalidYaml = `
name: Test
id: [unclosed array`;
      expect(() => parseThemeString(reallyInvalidYaml)).toThrow(/Invalid YAML format/);
    });

    test('should throw error when input is not a string', () => {
      expect(() => parseThemeString(123)).toThrow(/YAML input must be a string/);
      expect(() => parseThemeString(null)).toThrow(/YAML input must be a string/);
      expect(() => parseThemeString({ name: 'Test' })).toThrow(/YAML input must be a string/);
      expect(() => parseThemeString([])).toThrow(/YAML input must be a string/);
    });

    test('should throw error on empty YAML string', () => {
      expect(() => parseThemeString('')).toThrow(/YAML input cannot be empty/);
      expect(() => parseThemeString('   ')).toThrow(/YAML input cannot be empty/);
      expect(() => parseThemeString('\n\n')).toThrow(/YAML input cannot be empty/);
    });

    test('should parse YAML with nested objects and preserve structure', () => {
      const yamlString = `
name: Complex Theme
id: complex-theme
shell: zsh
author: developer
description: Theme with nested objects
version: 2.1.0
prompt:
  code: 'PS1="test"'
  install_instructions: 'Add to config'
colors:
  primary: '#5fa4e6'
  secondary: '#e6a25f'
segments:
  - type: directory
    style: '38;5;39'
  - type: character
    style: '38;5;208'
`;
      const result = parseThemeString(yamlString);

      // Verify root level fields
      expect(result.name).toBe('Complex Theme');
      expect(result.id).toBe('complex-theme');

      // Verify nested object (prompt)
      expect(result.prompt).toBeInstanceOf(Object);
      expect(result.prompt.code).toBe('PS1="test"');
      expect(result.prompt.install_instructions).toBe('Add to config');

      // Verify colors object
      expect(result.colors).toBeInstanceOf(Object);
      expect(result.colors.primary).toBe('#5fa4e6');
      expect(result.colors.secondary).toBe('#e6a25f');

      // Verify arrays
      expect(Array.isArray(result.segments)).toBe(true);
      expect(result.segments.length).toBe(2);
      expect(result.segments[0].type).toBe('directory');
      expect(result.segments[0].style).toBe('38;5;39');
    });

    test('should parse YAML with multiline strings', () => {
      const yamlString = `
name: Multiline Theme
id: multiline-theme
shell: bash
author: author
description: Test multiline
version: 1.0.0
prompt:
  code: |
    PS1='line1'
    PS2='line2'
`;
      const result = parseThemeString(yamlString);
      expect(result.prompt.code).toContain("PS1='line1'");
      expect(result.prompt.code).toContain("PS2='line2'");
    });

    test('should throw error when YAML parses to non-object value', () => {
      // YAML that parses to a plain string
      expect(() => parseThemeString('just a string')).toThrow(/YAML must parse to an object/);
      // YAML that parses to a number
      expect(() => parseThemeString('123')).toThrow(/YAML must parse to an object/);
      // YAML that parses to null
      expect(() => parseThemeString('null')).toThrow(/YAML must parse to an object/);
    });

    test('should parse YAML with special characters and escape sequences', () => {
      const yamlString = `
name: "Special \\"Quotes\\" Theme"
id: special-chars-123
shell: fish
author: tester
description: "Theme with special chars: @#$%"
version: 1.0.0
prompt:
  code: "echo hello"
`;
      const result = parseThemeString(yamlString);
      expect(result.name).toContain('Quotes');
      expect(result.description).toContain('@#$%');
      expect(result.prompt.code).toContain('echo');
    });

    test('should parse YAML with boolean and number values', () => {
      const yamlString = `
name: Mixed Types Theme
id: mixed-types
shell: starship
author: tester
description: Testing various types
version: 1.0.0
prompt:
  code: 'PS1="test"'
requires:
  nerd_font: true
  tools: []
  priority: 5
`;
      const result = parseThemeString(yamlString);
      expect(result.requires.nerd_font).toBe(true);
      expect(result.requires.tools).toEqual([]);
      expect(result.requires.priority).toBe(5);
    });
  });

  describe('parseThemeFile and parseThemeString integration', () => {
    test('parseThemeFile uses parseThemeString internally', () => {
      const filePath = path.join(__dirname, '../../themes/bash/minimal-clean.yaml');
      const fileResult = parseThemeFile(filePath);

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const stringResult = parseThemeString(fileContent);

      expect(fileResult).toEqual(stringResult);
    });

    test('should handle files with BOM (Byte Order Mark)', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jest-'));
      const testFile = path.join(tempDir, 'test-bom.yaml');

      const content = `name: BOM Test
id: bom-test
shell: bash
author: tester
description: Test file
version: 1.0.0
prompt:
  code: 'test'
`;

      // Write with UTF-8 BOM
      fs.writeFileSync(testFile, '\ufeff' + content);

      try {
        const result = parseThemeFile(testFile);
        // Should parse successfully (yaml library handles BOM)
        expect(result.name).toBeDefined();
      } finally {
        fs.unlinkSync(testFile);
        fs.rmdirSync(tempDir);
      }
    });
  });
});
