module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 30000,
};
