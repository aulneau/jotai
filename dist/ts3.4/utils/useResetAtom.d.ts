import { WritableAtom } from 'jotai'
import { RESET } from './atomWithReset'
export declare function useResetAtom<Value>(
  anAtom: WritableAtom<Value, typeof RESET>
): () => void | Promise<void>
