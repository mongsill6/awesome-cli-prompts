// Stub functions for awesome-cli-prompts

function installTheme(themeName) {
  console.log(`Installing theme: ${themeName}`);
}

function listThemes() {
  console.log('Available themes: bash, zsh, fish, starship');
}

function previewTheme(themeName) {
  console.log(`Previewing theme: ${themeName}`);
}

module.exports = {
  installTheme,
  listThemes,
  previewTheme,
};
