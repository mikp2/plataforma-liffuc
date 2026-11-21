export class ErrorValidacionCientifica extends Error {
  constructor(message) {
    super(message);
    this.name = "ErrorValidacionCientifica";
  }
}
