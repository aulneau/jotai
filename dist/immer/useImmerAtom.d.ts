import { Draft } from 'immer'
import { WritableAtom } from 'jotai'
export declare function useImmerAtom<Value>(
  anAtom: WritableAtom<Value, (draft: Draft<Value>) => void>
): [Value, (fn: (draft: Draft<Value>) => void) => void]
export declare function useImmerAtom<Value>(
  anAtom: WritableAtom<Value, (value: Value) => Value>
): [Value, (fn: (draft: Draft<Value>) => void) => void]
