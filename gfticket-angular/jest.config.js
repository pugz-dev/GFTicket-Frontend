/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    './src/services/**/*.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/components/**/*.ts': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
