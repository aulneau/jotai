import { atom } from 'jotai'
import { QueryClient, QueryObserver } from 'react-query'

const queryClientAtom = atom(null)
const getQueryClient = (get, set) => {
  let queryClient = get(queryClientAtom)
  if (queryClient === null) {
    queryClient = new QueryClient()
    set(queryClientAtom, queryClient)
  }
  return queryClient
}

const createPending = () => {
  const pending = {
    fulfilled: false,
  }
  pending.promise = new Promise((resolve) => {
    pending.resolve = (data) => {
      resolve(data)
      pending.fulfilled = true
    }
  })
  return pending
}

function atomWithQuery(createQuery) {
  const pendingAtom = atom(createPending())
  const dataAtom = atom(null)
  const queryAtom = atom(
    (get) => {
      const options =
        typeof createQuery === 'function' ? createQuery(get) : createQuery
      const observerAtom = atom(null, (get2, set, action) => {
        if (action.type === 'init') {
          const pending = get2(pendingAtom)
          if (pending.fulfilled) {
            set(pendingAtom, createPending())
          }
          action.initializer(getQueryClient(get2, set))
        } else if (action.type === 'data') {
          set(dataAtom, action.data)
          const pending = get2(pendingAtom)
          if (!pending.fulfilled) {
            pending.resolve(action.data)
          }
        }
      })
      observerAtom.onMount = (dispatch) => {
        let unsub
        const initializer = (queryClient) => {
          const observer = new QueryObserver(queryClient, options)
          observer.subscribe((result) => {
            if (result.data !== void 0) {
              dispatch({ type: 'data', data: result.data })
            }
          })
          if (unsub === false) {
            observer.destroy()
          } else {
            unsub = () => {
              observer.destroy()
            }
          }
        }
        dispatch({ type: 'init', initializer })
        return () => {
          if (unsub) {
            unsub()
          }
          unsub = false
        }
      }
      return [options, observerAtom]
    },
    (get, set, action) => {
      var _a
      if (action.type === 'refetch') {
        const [options] = get(queryAtom)
        set(pendingAtom, createPending())
        const queryClient = getQueryClient(get, set)
        ;(_a = queryClient.getQueryCache().find(options.queryKey)) == null
          ? void 0
          : _a.reset()
        const p = queryClient.refetchQueries(options.queryKey)
        return p
      }
      return
    }
  )
  const queryDataAtom = atom(
    (get) => {
      const [, observerAtom] = get(queryAtom)
      get(observerAtom)
      const data = get(dataAtom)
      const pending = get(pendingAtom)
      if (!pending.fulfilled) {
        return pending.promise
      }
      return data
    },
    (_get, set, action) => set(queryAtom, action)
  )
  return queryDataAtom
}

export { atomWithQuery, queryClientAtom }
