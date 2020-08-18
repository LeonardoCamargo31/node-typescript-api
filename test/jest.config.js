const { resolve } = require('path');
const root = resolve(__dirname, '..');
// importo a config do meu teste global
const rootConfig = require(`${root}/jest.config.js`);

// flag --runInBand para executar os testes em ordem

module.exports = {
  ...rootConfig,
  ...{
    rootDir: root,
    displayName: 'end2end-tests', // label para teste e2e
    setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
    testMatch: ['<rootDir>/test/**/*.test.ts'],
  },
};
