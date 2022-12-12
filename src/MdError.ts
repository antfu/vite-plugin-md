export class MdError extends Error {
  public kind = 'MdError' as const
  public name = 'MdError'
  public message: string

  constructor(msg: string) {
    super(msg)
    this.message = msg
  }
}
