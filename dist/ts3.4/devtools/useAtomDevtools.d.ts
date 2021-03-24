import { WritableAtom } from 'jotai'
export declare function useAtomDevtools<Value>(
  anAtom: WritableAtom<Value, Value>,
  name?: string
): void
