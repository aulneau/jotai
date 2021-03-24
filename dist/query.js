'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var jotai = require('jotai')
var reactQuery = require('react-query')

var queryClientAtom = jotai.atom(null)
var getQueryClient = function getQueryClient(get, set) {
  var queryClient = get(queryClientAtom)

  if (queryClient === null) {
    queryClient = new reactQuery.QueryClient()
    set(queryClientAtom, queryClient)
  }

  return queryClient
}

var createPending = function createPending() {
  var pending = {
    fulfilled: false,
  }
  pending.promise = new Promise(function (resolve) {
    pending.resolve = function (data) {
      resolve(data)
      pending.fulfilled = true
    }
  })
  return pending
}

function atomWithQuery(createQuery) {
  var pendingAtom = jotai.atom(createPending())
  var dataAtom = jotai.atom(null)
  var queryAtom = jotai.atom(
    function (get) {
      var options =
        typeof createQuery === 'function' ? createQuery(get) : createQuery
      var observerAtom = jotai.atom(null, function (get2, set, action) {
        if (action.type === 'init') {
          var pending = get2(pendingAtom)

          if (pending.fulfilled) {
            set(pendingAtom, createPending())
          }

          action.initializer(getQueryClient(get2, set))
        } else if (action.type === 'data') {
          set(dataAtom, action.data)

          var _pending = get2(pendingAtom)

          if (!_pending.fulfilled) {
            _pending.resolve(action.data)
          }
        }
      })

      observerAtom.onMount = function (dispatch) {
        var unsub

        var initializer = function initializer(queryClient) {
          var observer = new reactQuery.QueryObserver(queryClient, options)
          observer.subscribe(function (result) {
            if (result.data !== void 0) {
              dispatch({
                type: 'data',
                data: result.data,
              })
            }
          })

          if (unsub === false) {
            observer.destroy()
          } else {
            unsub = function unsub() {
              observer.destroy()
            }
          }
        }

        dispatch({
          type: 'init',
          initializer: initializer,
        })
        return function () {
          if (unsub) {
            unsub()
          }

          unsub = false
        }
      }

      return [options, observerAtom]
    },
    function (get, set, action) {
      var _a

      if (action.type === 'refetch') {
        var _get2 = get(queryAtom),
          options = _get2[0]

        set(pendingAtom, createPending())
        var queryClient = getQueryClient(get, set)
        ;(_a = queryClient.getQueryCache().find(options.queryKey)) == null
          ? void 0
          : _a.reset()
        var p = queryClient.refetchQueries(options.queryKey)
        return p
      }

      return
    }
  )
  var queryDataAtom = jotai.atom(
    function (get) {
      var _get3 = get(queryAtom),
        observerAtom = _get3[1]

      get(observerAtom)
      var data = get(dataAtom)
      var pending = get(pendingAtom)

      if (!pending.fulfilled) {
        return pending.promise
      }

      return data
    },
    function (_get, set, action) {
      return set(queryAtom, action)
    }
  )
  return queryDataAtom
}

exports.atomWithQuery = atomWithQuery
exports.queryClientAtom = queryClientAtom
