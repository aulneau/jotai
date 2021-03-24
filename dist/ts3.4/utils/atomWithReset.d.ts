import { WritableAtom } from 'jotai'
import { SetStateAction } from '../core/types'
export declare const RESET: unique symbol
export declare function atomWithReset<Value>(
  initialValue: Value
): WritableAtom<Value, typeof RESET | SetStateAction<Value>>
