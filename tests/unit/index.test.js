const { installTheme, listThemes, previewTheme } = require('../../src/index');

describe('awesome-cli-prompts', () => {
  let consoleLogSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('installTheme', () => {
    it('should log "Installing theme: {themeName}" when called', () => {
      installTheme('test');
      expect(consoleLogSpy).toHaveBeenCalledWith('Installing theme: test');
    });

    it('should call console.log exactly once', () => {
      installTheme('test');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should work with different theme names', () => {
      installTheme('bash');
      expect(consoleLogSpy).toHaveBeenCalledWith('Installing theme: bash');
    });
  });

  describe('listThemes', () => {
    it('should log message containing "Available themes"', () => {
      listThemes();
      expect(consoleLogSpy).toHaveBeenCalled();
      const callArg = consoleLogSpy.mock.calls[0][0];
      expect(callArg).toContain('Available themes');
    });

    it('should call console.log exactly once', () => {
      listThemes();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('previewTheme', () => {
    it('should log "Previewing theme: {themeName}" when called', () => {
      previewTheme('test');
      expect(consoleLogSpy).toHaveBeenCalledWith('Previewing theme: test');
    });

    it('should call console.log exactly once', () => {
      previewTheme('test');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should work with different theme names', () => {
      previewTheme('zsh');
      expect(consoleLogSpy).toHaveBeenCalledWith('Previewing theme: zsh');
    });
  });

  describe('Module exports', () => {
    it('should export installTheme function', () => {
      expect(typeof installTheme).toBe('function');
    });

    it('should export listThemes function', () => {
      expect(typeof listThemes).toBe('function');
    });

    it('should export previewTheme function', () => {
      expect(typeof previewTheme).toBe('function');
    });

    it('should export all three functions', () => {
      const exported = require('../../src/index');
      expect(Object.keys(exported)).toContain('installTheme');
      expect(Object.keys(exported)).toContain('listThemes');
      expect(Object.keys(exported)).toContain('previewTheme');
      expect(Object.keys(exported).length).toBe(3);
    });
  });
});
