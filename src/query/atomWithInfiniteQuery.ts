import {
  QueryKey,
  InfiniteQueryObserver,
  InfiniteQueryObserverOptions,
  InfiniteData,
  InitialDataFunction,
  QueryObserverResult,
} from 'react-query'
import { atom } from 'jotai'
import type { WritableAtom, Getter } from 'jotai'
import { getQueryClientAtom } from './queryClientAtom'

export type AtomWithInfiniteQueryAction = {
  type: 'refetch' | 'fetchNextPage' | 'fetchPreviousPage'
}

export type AtomWithInfiniteQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryData
> = InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryData> & {
  queryKey: QueryKey
}

export function atomWithInfiniteQuery<
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData
>(
  createQuery:
    | AtomWithInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData>
    | ((
        get: Getter
      ) => AtomWithInfiniteQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryData
      >),
  equalityFn: (
    a: InfiniteData<TData>,
    b: InfiniteData<TData>
  ) => boolean = Object.is
): WritableAtom<InfiniteData<TData | TQueryData>, AtomWithInfiniteQueryAction> {
  const queryDataAtom = atom(
    (get) => {
      const queryClient = get(getQueryClientAtom)
      const options =
        typeof createQuery === 'function' ? createQuery(get) : createQuery
      let settlePromise:
        | ((data: InfiniteData<TData> | null, err?: TError) => void)
        | null = null
      const getInitialData = () =>
        typeof options.initialData === 'function'
          ? (
              options.initialData as InitialDataFunction<
                InfiniteData<TQueryData>
              >
            )()
          : options.initialData
      const dataAtom = atom<
        | InfiniteData<TData | TQueryData>
        | Promise<InfiniteData<TData | TQueryData>>
      >(
        getInitialData() ||
          new Promise<InfiniteData<TData>>((resolve, reject) => {
            settlePromise = (data, err) => {
              if (err) {
                reject(err)
              } else {
                resolve(data as InfiniteData<TData>)
              }
            }
          })
      )
      let setData: (
        data: InfiniteData<TData> | Promise<InfiniteData<TData>>
      ) => void = () => {
        throw new Error('atomWithInfiniteQuery: setting data without mount')
      }
      let prevData: InfiniteData<TData> | null = null

      const listener = (
        result:
          | QueryObserverResult<InfiniteData<TData>, TError>
          | { data?: undefined; error: TError }
      ) => {
        if (result.error) {
          if (settlePromise) {
            settlePromise(null, result.error)
            settlePromise = null
          } else {
            setData(Promise.reject<InfiniteData<TData>>(result.error))
          }
          return
        }
        if (
          result.data === undefined ||
          (prevData !== null && equalityFn(prevData, result.data))
        ) {
          return
        }
        prevData = result.data
        if (settlePromise) {
          settlePromise(result.data)
          settlePromise = null
        } else {
          setData(result.data)
        }
      }

      const defaultedOptions = queryClient.defaultQueryObserverOptions(options)

      if (typeof defaultedOptions.staleTime !== 'number') {
        defaultedOptions.staleTime = 1000
      }

      const observer = new InfiniteQueryObserver(queryClient, defaultedOptions)

      observer
        .fetchOptimistic(defaultedOptions)
        .then(listener)
        .catch((error) => listener({ error }))

      dataAtom.onMount = (update) => {
        setData = update
        const unsubscribe = observer?.subscribe(listener)
        return unsubscribe
      }
      return { dataAtom, observer, options }
    },
    (get, set, action: AtomWithInfiniteQueryAction) => {
      const { observer } = get(queryDataAtom)
      switch (action.type) {
        case 'refetch': {
          void observer.refetch()
          break
        }
        case 'fetchPreviousPage': {
          void observer.fetchPreviousPage()
          break
        }
        case 'fetchNextPage': {
          void observer.fetchNextPage()
          break
        }
      }
    }
  )

  const queryAtom = atom<
    InfiniteData<TData | TQueryData>,
    AtomWithInfiniteQueryAction
  >(
    (get) => {
      const { dataAtom } = get(queryDataAtom)
      return get(dataAtom)
    },
    (_get, set, action) => set(queryDataAtom, action) // delegate action
  )
  return queryAtom
}
