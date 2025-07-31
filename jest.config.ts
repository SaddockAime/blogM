import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__test__/**/*.tests.ts', '**/?(*.)+(spec|test).ts'],
  
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
    '<rootDir>/src/database/migrations/',
    '<rootDir>/src/database/seeders/',
    '<rootDir>/src/docs/',
    '<rootDir>/src/middleware/',
    '<rootDir>/src/utils/',
    '<rootDir>/src/config/',
  ],
  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.tests.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
    '!src/database/migrations/**',
    '!src/database/seeders/**',
    '!src/docs/**',
    '!src/middleware/**',
    '!src/config/**',
    '!src/utils/**',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Exclude modules from being resolved during testing
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  forceExit: true,
  detectOpenHandles: true,
//   // Coverage thresholds (optional)
//   coverageThreshold: {
//     global: {
//       branches: 80,
//       functions: 80,
//       lines: 80,
//       statements: 80
//     }
//   }
};

export default config;