import { Context } from 'react'
import { AnyAtom, WritableAtom, Scope } from './types'
import { NewAtomReceiver } from './vanilla'
import { createMutableSource } from './useMutableSource'
declare type MutableSource = ReturnType<typeof createMutableSource>
export declare type Store = [
  /*mutableSource*/ MutableSource,
  /*updateAtom*/ <Value, Update>(
    atom: WritableAtom<Value, Update>,
    update: Update
  ) => void | Promise<void>
]
export declare const createStore: (
  initialValues?: Iterable<readonly [AnyAtom, unknown]> | undefined,
  newAtomReceiver?: NewAtomReceiver | undefined
) => Store
declare type StoreContext = Context<Store>
export declare const getStoreContext: (
  scope?: Scope | undefined
) => StoreContext
export {}
