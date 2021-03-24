import type { WritableAtom } from 'jotai'
import type { SetAtom } from '../core/types'
export declare function useUpdateAtom<Value, Update>(
  anAtom: WritableAtom<Value, Update>
): SetAtom<Update>
