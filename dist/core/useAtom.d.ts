import type { Atom, WritableAtom, SetAtom } from './types'
export declare function useAtom<Value, Update>(
  atom: WritableAtom<Value, Update>
): [Value, SetAtom<Update>]
export declare function useAtom<Value>(atom: Atom<Value>): [Value, never]
