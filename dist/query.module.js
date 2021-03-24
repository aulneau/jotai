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
      const observerAtom = atom(null, (get, set, action) => {
        if (action.type === 'init') {
          const pending = get(pendingAtom)

          if (pending.fulfilled) {
            set(pendingAtom, createPending()) // new fetch
          }

          action.initializer(getQueryClient(get, set))
        } else if (action.type === 'data') {
          set(dataAtom, action.data)
          const pending = get(pendingAtom)

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
            // TODO error handling
            if (result.data !== undefined) {
              dispatch({
                type: 'data',
                data: result.data,
              })
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

        dispatch({
          type: 'init',
          initializer,
        })
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
      if (action.type === 'refetch') {
        var _queryClient$getQuery

        const [options] = get(queryAtom)
        set(pendingAtom, createPending()) // reset pending

        const queryClient = getQueryClient(get, set)
        ;(_queryClient$getQuery = queryClient
          .getQueryCache()
          .find(options.queryKey)) == null
          ? void 0
          : _queryClient$getQuery.reset()
        const p = queryClient.refetchQueries(options.queryKey)
        return p
      }

      return
    }
  )
  const queryDataAtom = atom(
    (get) => {
      const [, observerAtom] = get(queryAtom)
      get(observerAtom) // use it here

      const data = get(dataAtom)
      const pending = get(pendingAtom)

      if (!pending.fulfilled) {
        return pending.promise
      } // we are sure that data is not null

      return data
    },
    (_get, set, action) => set(queryAtom, action) // delegate action
  )
  return queryDataAtom
}

export { atomWithQuery, queryClientAtom }
