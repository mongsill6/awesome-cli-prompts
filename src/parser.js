const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * Parse a YAML theme file and return the parsed JavaScript object
 * @param {string} filePath - Path to the YAML theme file
 * @returns {object} Parsed theme object
 * @throws {Error} If file cannot be read or YAML is invalid
 */
function parseThemeFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Theme file not found: ${absolutePath}`);
    }

    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    return parseThemeString(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Theme file not found: ${filePath}`);
    }
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied reading theme file: ${filePath}`);
    }
    if (error.message.includes('YAML')) {
      throw error;
    }
    throw new Error(`Error reading theme file: ${error.message}`);
  }
}

/**
 * Parse a YAML string and return the parsed JavaScript object
 * @param {string} yamlString - YAML content as string
 * @returns {object} Parsed theme object
 * @throws {Error} If YAML is invalid
 */
function parseThemeString(yamlString) {
  try {
    if (typeof yamlString !== 'string') {
      throw new Error('YAML input must be a string');
    }

    if (yamlString.trim() === '') {
      throw new Error('YAML input cannot be empty');
    }

    const parsed = yaml.parse(yamlString);

    if (parsed === null || typeof parsed !== 'object') {
      throw new Error('YAML must parse to an object (theme)');
    }

    return parsed;
  } catch (error) {
    if (error instanceof yaml.YAMLError) {
      throw new Error(`Invalid YAML format: ${error.message}`);
    }
    throw error;
  }
}

module.exports = {
  parseThemeFile,
  parseThemeString
};
