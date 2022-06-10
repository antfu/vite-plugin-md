export type ReturnValues = string | string[] | number | boolean | Object;

export const valueOrCallback = <
    A extends any[],
    I extends ReturnValues | ((...args: A) => ReturnValues),
>(value: I, args: I extends Function ? A : never = undefined as never) => {
    return (
        typeof value === "function"
        ? value(...args)
        : value
    ) as I
} 
