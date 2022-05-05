export const log = <P extends any>(logger: (p: P) => string) => (payload: P) => {
  console.log(logger(payload))
  return payload
}