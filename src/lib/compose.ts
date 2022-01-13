export default function compose<T>(value: T, ...funcs: ((value: T) => T)[]) {
  return funcs.reduce((acc, func) => {
    const f = typeof func === "function" ? func : (value: T) => value
    return f(acc)
  }, value)
}
