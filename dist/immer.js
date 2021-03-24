'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var immer = require('immer')
var jotai = require('jotai')
var react = require('react')

/* eslint-disable import/named */
function atomWithImmer(initialValue) {
  var anAtom = jotai.atom(initialValue, function (get, set, fn) {
    return set(
      anAtom,
      immer.produce(get(anAtom), function (draft) {
        return fn(draft)
      })
    )
  })
  return anAtom
}

/* eslint-disable import/named */
function useImmerAtom(anAtom) {
  var _useAtom = jotai.useAtom(anAtom),
    state = _useAtom[0],
    setState = _useAtom[1]

  var setStateWithImmer = react.useCallback(
    function (fn) {
      setState(
        immer.produce(function (draft) {
          return fn(draft)
        })
      )
    },
    [setState]
  )
  return [state, setStateWithImmer]
}

var getWeakCacheItem = function getWeakCacheItem(cache, deps) {
  var dep = deps[0],
    rest = deps.slice(1)
  var entry = cache.get(dep)

  if (!entry) {
    return
  }

  if (!rest.length) {
    return entry[1]
  }

  return getWeakCacheItem(entry[0], rest)
}
var setWeakCacheItem = function setWeakCacheItem(cache, deps, item) {
  var dep = deps[0],
    rest = deps.slice(1)
  var entry = cache.get(dep)

  if (!entry) {
    entry = [new WeakMap()]
    cache.set(dep, entry)
  }

  if (!rest.length) {
    entry[1] = item
    return
  }

  setWeakCacheItem(entry[0], rest, item)
}

/* eslint-disable import/named */
var withImmerCache = new WeakMap()
function withImmer(anAtom) {
  var deps = [anAtom]
  var cachedAtom = getWeakCacheItem(withImmerCache, deps)

  if (cachedAtom) {
    return cachedAtom
  }

  var derivedAtom = jotai.atom(
    function (get) {
      return get(anAtom)
    },
    function (get, set, fn) {
      return set(
        anAtom,
        immer.produce(get(anAtom), function (draft) {
          return fn(draft)
        })
      )
    }
  )
  derivedAtom.scope = anAtom.scope
  setWeakCacheItem(withImmerCache, deps, derivedAtom)
  return derivedAtom
}

exports.atomWithImmer = atomWithImmer
exports.useImmerAtom = useImmerAtom
exports.withImmer = withImmer
