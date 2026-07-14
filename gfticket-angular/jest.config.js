/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$|temporal-polyfill/|temporal-utils/))',
  ],
  moduleNameMapper: {
    '^temporal-polyfill$': '<rootDir>/node_modules/temporal-polyfill/index.js',
    '^temporal-utils$': '<rootDir>/node_modules/temporal-utils/dist/index.js',
    '^temporal-utils/protected$':
      '<rootDir>/node_modules/temporal-utils/dist/protected.js',
    '^temporal-utils/protected-error-messages$':
      '<rootDir>/node_modules/temporal-utils/dist/protected-error-messages.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
};
