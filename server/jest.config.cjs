module.exports = {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/tests/setup-mongo.js"],
  moduleFileExtensions: ["js", "json"],
  testMatch: ["**/tests/**/*.test.js"],
};