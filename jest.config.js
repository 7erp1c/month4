/** @typeForReqRes {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleFileExtensions:[
    'js',
    'json',
    'ts'
  ],
  rootDir:'.',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 100000,
  testRegex: '.test.ts$'
};