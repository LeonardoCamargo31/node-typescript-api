import { SetupServer } from '@src/server';
import supertest from 'supertest';

beforeAll(() => {
  // antes dos testes vamos inicializar o server
  const server = new SetupServer();
  server.init();
  global.testRequest = supertest(server.getApp());
});
