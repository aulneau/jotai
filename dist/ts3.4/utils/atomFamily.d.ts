import { Atom, WritableAtom, PrimitiveAtom } from 'jotai'
import { Getter, Setter } from '../core/types'
declare type AnyFunction = (...args: any[]) => any
declare type ShouldRemove<Param> = (createdAt: number, param: Param) => boolean
declare type AtomFamily<Param, AtomType> = {
  (param: Param): AtomType
  remove(param: Param): void
  setShouldRemove(shouldRemove: ShouldRemove<Param> | null): void
}
export declare function atomFamily<Param, Value, Update>(
  initializeRead: (param: Param) => (get: Getter) => Value | Promise<Value>,
  initializeWrite: (
    param: Param
  ) => (get: Getter, set: Setter, update: Update) => void | Promise<void>,
  areEqual?: (a: Param, b: Param) => boolean
): AtomFamily<Param, WritableAtom<Value, Update>>
export declare function atomFamily<Param, Value, Update>(
  initializeRead: (param: Param) => Value,
  initializeWrite: (
    param: Param
  ) => (get: Getter, set: Setter, update: Update) => void | Promise<void>,
  areEqual?: (a: Param, b: Param) => boolean
): Value extends AnyFunction
  ? never
  : AtomFamily<Param, WritableAtom<Value, Update>>
export declare function atomFamily<Param, Value, Update extends never = never>(
  initializeRead: (param: Param) => (get: Getter) => Value | Promise<Value>,
  initializeWrite?: null,
  areEqual?: (a: Param, b: Param) => boolean
): AtomFamily<Param, Atom<Value>>
export declare function atomFamily<Param, Value>(
  initializeRead: (param: Param) => AnyFunction,
  initializeWrite?: null,
  areEqual?: (a: Param, b: Param) => boolean
): never
export declare function atomFamily<Param, Value>(
  initializeRead: (param: Param) => Value,
  initializeWrite?: null,
  areEqual?: (a: Param, b: Param) => boolean
): AtomFamily<Param, PrimitiveAtom<Value>>
export {}
