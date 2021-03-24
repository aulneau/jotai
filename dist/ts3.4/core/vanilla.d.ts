import { Atom, WritableAtom, AnyAtom, OnUnmount } from './types'
declare type Revision = number
declare type InvalidatedRevision = number
declare type ReadDependencies = Map<AnyAtom, Revision>
export declare type AtomState<Value = unknown> = {
  e?: Error
  p?: Promise<void>
  w?: Promise<void>
  v?: Value
  r: Revision
  i?: InvalidatedRevision
  d: ReadDependencies
}
declare type AtomStateMap = WeakMap<AnyAtom, AtomState>
declare type Listeners = Set<() => void>
declare type Dependents = Set<AnyAtom>
declare type Mounted = {
  l: Listeners
  d: Dependents
  u: OnUnmount | void
}
declare type MountedMap = WeakMap<AnyAtom, Mounted>
export declare type NewAtomReceiver = (newAtom: AnyAtom) => void
declare type StateVersion = number
declare type PendingAtoms = Set<AnyAtom>
export declare type State = {
  n?: NewAtomReceiver
  v: StateVersion
  a: AtomStateMap
  m: MountedMap
  p: PendingAtoms
}
export declare const createState: (
  initialValues?: Iterable<readonly [AnyAtom, unknown]> | undefined,
  newAtomReceiver?: NewAtomReceiver | undefined
) => State
export declare const readAtom: <Value>(
  state: State,
  readingAtom: Atom<Value>
) => AtomState<Value>
export declare const writeAtom: <Value, Update>(
  state: State,
  writingAtom: WritableAtom<Value, Update>,
  update: Update
) => void | Promise<void>
export declare const subscribeAtom: (
  state: State,
  atom: AnyAtom,
  callback: () => void
) => () => void
export {}
