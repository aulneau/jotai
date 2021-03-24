import { QueryClient } from 'react-query'
import type { Getter, Setter } from '../core/types'
export declare const queryClientAtom: import('jotai').Atom<QueryClient | null> & {
  write: import('../core/types').Write<
    import('../core/types').SetStateAction<QueryClient | null>
  >
  onMount?:
    | import('../core/types').OnMount<
        import('../core/types').SetStateAction<QueryClient | null>
      >
    | undefined
} & import('../core/types').WithInitialValue<QueryClient | null>
export declare const getQueryClient: (get: Getter, set: Setter) => QueryClient
