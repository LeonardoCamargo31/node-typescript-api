// globals.d.ts=> d de decorators
declare namespace NodeJS {
  interface Global {
    // https://stackoverflow.com/a/51114250
    // https://youtu.be/OJYsN4DcLQQ?t=1425

    // adicionar o tipo testRequest, para não ter problema em nosso teste
    // await global.testRequest.get('/forecast')

    // import inline para ser global, se não vai ficar local
    testRequest: import('supertest').SuperTest<import('supertest').Test>;
  }
}
