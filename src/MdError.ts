export class MdError extends Error {
  public kind: 'MdError' = 'MdError'
  public name = 'MdError'
  public message: string

  constructor(msg: string) {
    super(msg)
    this.message = msg
  }
}
