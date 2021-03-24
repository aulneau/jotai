import { PrimitiveAtom } from 'jotai'
export declare function useReducerAtom<Value, Action>(
  anAtom: PrimitiveAtom<Value>,
  reducer: (v: Value, a?: Action) => Value
): [Value, (action?: Action) => void]
export declare function useReducerAtom<Value, Action>(
  anAtom: PrimitiveAtom<Value>,
  reducer: (v: Value, a: Action) => Value
): [Value, (action: Action) => void]
