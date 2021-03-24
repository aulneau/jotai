import { QueryKey, QueryObserverOptions } from 'react-query'
import { WritableAtom } from 'jotai'
import type { Getter } from '../core/types'
declare type ResultActions = {
  type: 'refetch'
}
declare type AtomQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryData
> = QueryObserverOptions<TQueryFnData, TError, TData, TQueryData> & {
  queryKey: QueryKey
}
export declare function atomWithQuery<
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData
>(
  createQuery:
    | AtomQueryOptions<TQueryFnData, TError, TData, TQueryData>
    | ((
        get: Getter
      ) => AtomQueryOptions<TQueryFnData, TError, TData, TQueryData>)
): WritableAtom<TData, ResultActions>
export {}
