import {
  Read,
  Write,
  Atom,
  WritableAtom,
  WithInitialValue,
  PrimitiveAtom,
} from './types'
declare type AnyFunction = (...args: any[]) => any
export declare function atom<Value, Update>(
  read: Read<Value>,
  write: Write<Update>
): WritableAtom<Value, Update>
export declare function atom<Value, Update>(
  read: Value,
  write: Write<Update>
): Value extends AnyFunction
  ? never
  : WritableAtom<Value, Update> & WithInitialValue<Value>
export declare function atom<Value>(read: Read<Value>): Atom<Value>
export declare function atom(read: AnyFunction): never
export declare function atom<Value>(
  initialValue: Value
): PrimitiveAtom<Value> & WithInitialValue<Value>
export {}
