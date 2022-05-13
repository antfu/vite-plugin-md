export const log = <P>(logger: (p: P) => string) => (payload: P) => {
  // eslint-disable-next-line no-console
  console.log(logger(payload))
  return payload
}
