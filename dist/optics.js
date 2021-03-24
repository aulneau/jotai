'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var jotai = require('jotai')
var O = require('optics-ts')

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

var focusAtomCache = new WeakMap()

var isFunction = function isFunction(x) {
  return typeof x === 'function'
}

function focusAtom(baseAtom, callback) {
  var deps = [baseAtom, callback]
  var cachedAtom = getWeakCacheItem(focusAtomCache, deps)

  if (cachedAtom) {
    return cachedAtom
  }

  var focus = callback(O.optic())
  var derivedAtom = jotai.atom(
    function (get) {
      var newValue = getValueUsingOptic(focus, get(baseAtom))
      return newValue
    },
    function (_, set, update) {
      var newValueProducer = isFunction(update)
        ? O.modify(focus)(update)
        : O.set(focus)(update)
      set(baseAtom, newValueProducer)
    }
  )
  derivedAtom.scope = baseAtom.scope
  setWeakCacheItem(focusAtomCache, deps, derivedAtom)
  return derivedAtom
}

var getValueUsingOptic = function getValueUsingOptic(focus, bigValue) {
  if (focus._tag === 'Traversal') {
    var values = O.collect(focus)(bigValue)
    return values
  }

  if (focus._tag === 'Prism') {
    var value2 = O.preview(focus)(bigValue)
    return value2
  }

  var value = O.get(focus)(bigValue)
  return value
}

exports.focusAtom = focusAtom
