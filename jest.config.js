const { resolve } = require('path');
const root = resolve(__dirname);

module.exports = {
  rootDir: root, // vai ser esse diretório raiz
  displayName: 'root-tests', // vai aparecer um label qual test usa a config global
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testEnvironment: 'node',
  clearMocks: true, // limpar mocks por padrão
  preset: 'ts-jest',
  moduleNameMapper: { // para usar o alias nos testes também
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
};