module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/cli.js',
    '!src/commands/interactive.js',
  ],
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.js'],
};
