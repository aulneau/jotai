import { WritableAtom } from 'jotai'
import { SetAtom } from '../core/types'
export declare function useUpdateAtom<Value, Update>(
  anAtom: WritableAtom<Value, Update>
): SetAtom<Update>
