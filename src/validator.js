const VALID_SHELLS = ['bash', 'zsh', 'fish', 'starship'];
const ID_PATTERN = /^[a-z0-9-]+$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+/;

function validateTheme(themeObj) {
  const errors = [];

  // Validate name
  if (!themeObj.name || typeof themeObj.name !== 'string' || themeObj.name.trim() === '') {
    errors.push('Field "name" is required and must be a non-empty string');
  }

  // Validate id
  if (!themeObj.id || typeof themeObj.id !== 'string' || themeObj.id.trim() === '') {
    errors.push('Field "id" is required and must be a non-empty string');
  } else if (!ID_PATTERN.test(themeObj.id)) {
    errors.push('Field "id" must match pattern /^[a-z0-9-]+$/');
  }

  // Validate shell
  if (!themeObj.shell || typeof themeObj.shell !== 'string' || themeObj.shell.trim() === '') {
    errors.push('Field "shell" is required and must be a non-empty string');
  } else if (!VALID_SHELLS.includes(themeObj.shell)) {
    errors.push(`Field "shell" must be one of: ${VALID_SHELLS.join(', ')}`);
  }

  // Validate author
  if (!themeObj.author || typeof themeObj.author !== 'string' || themeObj.author.trim() === '') {
    errors.push('Field "author" is required and must be a non-empty string');
  }

  // Validate description
  if (!themeObj.description || typeof themeObj.description !== 'string' || themeObj.description.trim() === '') {
    errors.push('Field "description" is required and must be a non-empty string');
  }

  // Validate version
  if (!themeObj.version || typeof themeObj.version !== 'string' || themeObj.version.trim() === '') {
    errors.push('Field "version" is required and must be a non-empty string');
  } else if (!SEMVER_PATTERN.test(themeObj.version)) {
    errors.push('Field "version" must be semver-like format (e.g. "1.0.0")');
  }

  // Validate prompt.code
  if (!themeObj.prompt || typeof themeObj.prompt !== 'object' || themeObj.prompt === null) {
    errors.push('Field "prompt" is required and must be an object');
  } else if (!themeObj.prompt.code || typeof themeObj.prompt.code !== 'string' || themeObj.prompt.code.trim() === '') {
    errors.push('Field "prompt.code" is required and must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  validateTheme
};
