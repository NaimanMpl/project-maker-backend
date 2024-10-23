/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@models/(.*)$": "<rootDir>/src/models/$1",
  },
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/src/tests/jest.setup.ts"],
};

export default config;
