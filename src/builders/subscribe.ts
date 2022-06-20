/**
 * Subscribes a builder to another builder's event
 */
export const subscribe = <
  B extends BuilderApi,
  E extends any,
  CB extends any,
>(_builder: B, _event: E, _callback: CB) => {
  //
}
