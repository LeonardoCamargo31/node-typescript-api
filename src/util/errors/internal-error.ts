export class InternalError extends Error {
  constructor(
    public message: string,
    protected code: number = 500,
    protected description?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    // quando estourar um erro essa classe não aparecer no erro
    // e mostramos a partir de onde o erro foi chamado
    Error.captureStackTrace(this, this.constructor);
  }
}
