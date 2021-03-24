import type { Getter, Setter, Scope } from '../core/types'
export declare function useAtomCallback<Result>(
  callback: (get: Getter, set: Setter) => Result,
  scope?: Scope
): () => Promise<Result>
export declare function useAtomCallback<Result, Arg>(
  callback: (get: Getter, set: Setter, arg: Arg) => Result,
  scope?: Scope
): (arg: Arg) => Promise<Result>
