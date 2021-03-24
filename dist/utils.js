'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var react = require('react')
var jotai = require('jotai')

function useUpdateAtom(anAtom) {
  var StoreContext = jotai.SECRET_INTERNAL_getStoreContext(anAtom.scope)

  var _useContext = react.useContext(StoreContext),
    updateAtom = _useContext[1]

  var setAtom = react.useCallback(
    function (update) {
      return updateAtom(anAtom, update)
    },
    [updateAtom, anAtom]
  )
  return setAtom
}

function useAtomValue(anAtom) {
  return jotai.useAtom(anAtom)[0]
}

var RESET = Symbol()
function atomWithReset(initialValue) {
  var anAtom = jotai.atom(initialValue, function (get, set, update) {
    if (update === RESET) {
      set(anAtom, initialValue)
    } else {
      set(anAtom, typeof update === 'function' ? update(get(anAtom)) : update)
    }
  })
  return anAtom
}

function useResetAtom(anAtom) {
  var StoreContext = jotai.SECRET_INTERNAL_getStoreContext(anAtom.scope)

  var _useContext = react.useContext(StoreContext),
    updateAtom = _useContext[1]

  var setAtom = react.useCallback(
    function () {
      return updateAtom(anAtom, RESET)
    },
    [updateAtom, anAtom]
  )
  return setAtom
}

function useReducerAtom(anAtom, reducer) {
  var _useAtom = jotai.useAtom(anAtom),
    state = _useAtom[0],
    setState = _useAtom[1]

  var dispatch = react.useCallback(
    function (action) {
      setState(function (prev) {
        return reducer(prev, action)
      })
    },
    [setState, reducer]
  )
  return [state, dispatch]
}

function atomWithReducer(initialValue, reducer) {
  var anAtom = jotai.atom(initialValue, function (get, set, action) {
    return set(anAtom, reducer(get(anAtom), action))
  })
  return anAtom
}

function _createForOfIteratorHelperLoose$1(o, allowArrayLike) {
  var it
  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray$1(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it
      var i = 0
      return function () {
        if (i >= o.length) return { done: true }
        return { done: false, value: o[i++] }
      }
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    )
  }
  it = o[Symbol.iterator]()
  return it.next.bind(it)
}

function _unsupportedIterableToArray$1(o, minLen) {
  if (!o) return
  if (typeof o === 'string') return _arrayLikeToArray$1(o, minLen)
  var n = Object.prototype.toString.call(o).slice(8, -1)
  if (n === 'Object' && o.constructor) n = o.constructor.name
  if (n === 'Map' || n === 'Set') return Array.from(o)
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray$1(o, minLen)
}

function _arrayLikeToArray$1(arr, len) {
  if (len == null || len > arr.length) len = arr.length
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i]
  }
  return arr2
}
function atomFamily(initializeRead, initializeWrite, areEqual) {
  var shouldRemove = null
  var atoms = new Map()

  var createAtom = function createAtom(param) {
    var item

    if (areEqual === void 0) {
      item = atoms.get(param)
    } else {
      for (
        var _iterator = _createForOfIteratorHelperLoose$1(atoms), _step;
        !(_step = _iterator()).done;

      ) {
        var _step$value = _step.value,
          key = _step$value[0],
          value = _step$value[1]

        if (areEqual(key, param)) {
          item = value
          break
        }
      }
    }

    if (item !== void 0) {
      if (shouldRemove == null ? void 0 : shouldRemove(item[1], param)) {
        atoms.delete(param)
      } else {
        return item[0]
      }
    }

    var newAtom = jotai.atom(
      initializeRead(param),
      initializeWrite && initializeWrite(param)
    )
    atoms.set(param, [newAtom, Date.now()])
    return newAtom
  }

  createAtom.remove = function (param) {
    if (areEqual === void 0) {
      atoms.delete(param)
    } else {
      for (
        var _iterator2 = _createForOfIteratorHelperLoose$1(atoms), _step2;
        !(_step2 = _iterator2()).done;

      ) {
        var _step2$value = _step2.value,
          key = _step2$value[0]

        if (areEqual(key, param)) {
          atoms.delete(key)
          break
        }
      }
    }
  }

  createAtom.setShouldRemove = function (fn) {
    shouldRemove = fn
    if (!shouldRemove) return

    for (
      var _iterator3 = _createForOfIteratorHelperLoose$1(atoms), _step3;
      !(_step3 = _iterator3()).done;

    ) {
      var _step3$value = _step3.value,
        key = _step3$value[0],
        value = _step3$value[1]

      if (shouldRemove(value[1], key)) {
        atoms.delete(key)
      }
    }
  }

  return createAtom
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

var selectAtomCache = new WeakMap()
function selectAtom(anAtom, selector, equalityFn) {
  if (equalityFn === void 0) {
    equalityFn = Object.is
  }

  var deps = [anAtom, selector, equalityFn]
  var cachedAtom = getWeakCacheItem(selectAtomCache, deps)

  if (cachedAtom) {
    return cachedAtom
  }

  var initialized = false
  var prevSlice
  var derivedAtom = jotai.atom(function (get) {
    var slice = selector(get(anAtom))

    if (initialized && equalityFn(prevSlice, slice)) {
      return prevSlice
    }

    initialized = true
    prevSlice = slice
    return slice
  })
  derivedAtom.scope = anAtom.scope
  setWeakCacheItem(selectAtomCache, deps, derivedAtom)
  return derivedAtom
}

function useAtomCallback(callback, scope) {
  var anAtom = react.useMemo(
    function () {
      return jotai.atom(null, function (get, set, _ref) {
        var arg = _ref[0],
          resolve = _ref[1],
          reject = _ref[2]

        try {
          resolve(callback(get, set, arg))
        } catch (e) {
          reject(e)
        }
      })
    },
    [callback]
  )
  anAtom.scope = scope

  var _useAtom = jotai.useAtom(anAtom),
    invoke = _useAtom[1]

  return react.useCallback(
    function (arg) {
      return new Promise(function (resolve, reject) {
        invoke([arg, resolve, reject])
      })
    },
    [invoke]
  )
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it
  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it
      var i = 0
      return function () {
        if (i >= o.length) return { done: true }
        return { done: false, value: o[i++] }
      }
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    )
  }
  it = o[Symbol.iterator]()
  return it.next.bind(it)
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen)
  var n = Object.prototype.toString.call(o).slice(8, -1)
  if (n === 'Object' && o.constructor) n = o.constructor.name
  if (n === 'Map' || n === 'Set') return Array.from(o)
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen)
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i]
  }
  return arr2
}

var deepFreeze = function deepFreeze(obj) {
  if (typeof obj !== 'object' || obj === null) return
  Object.freeze(obj)
  var propNames = Object.getOwnPropertyNames(obj)

  for (
    var _iterator = _createForOfIteratorHelperLoose(propNames), _step;
    !(_step = _iterator()).done;

  ) {
    var name = _step.value
    var value = obj[name]
    deepFreeze(value)
  }

  return obj
}

function freezeAtom(anAtom) {
  var frozenAtom = jotai.atom(
    function (get) {
      return deepFreeze(get(anAtom))
    },
    function (_get, set, arg) {
      return set(anAtom, arg)
    }
  )
  frozenAtom.scope = anAtom.scope
  return frozenAtom
}

var atomFrozen = function atomFrozen(read, write) {
  var anAtom = jotai.atom(read, write)
  var origRead = anAtom.read

  anAtom.read = function (get) {
    return deepFreeze(origRead(get))
  }

  return anAtom
}

var atomFrozenInDev =
  typeof process === 'object' && process.env.NODE_ENV === 'development'
    ? atomFrozen
    : jotai.atom

var splitAtomCache = new WeakMap()

var isWritable = function isWritable(atom2) {
  return !!atom2.write
}

var isFunction = function isFunction(x) {
  return typeof x === 'function'
}

function splitAtom(arrAtom, keyExtractor) {
  var deps = keyExtractor ? [arrAtom, keyExtractor] : [arrAtom]
  var cachedAtom = getWeakCacheItem(splitAtomCache, deps)

  if (cachedAtom) {
    return cachedAtom
  }

  var currentAtomList
  var currentKeyList

  var keyToAtom = function keyToAtom(key) {
    var index = currentKeyList == null ? void 0 : currentKeyList.indexOf(key)

    if (index === void 0 || index === -1) {
      return void 0
    }

    return currentAtomList == null ? void 0 : currentAtomList[index]
  }

  var read = function read(get) {
    var nextAtomList = []
    var nextKeyList = []
    get(arrAtom).forEach(function (item, index) {
      var key = keyExtractor ? keyExtractor(item) : index
      nextKeyList[index] = key
      var cachedAtom2 = keyToAtom(key)

      if (cachedAtom2) {
        nextAtomList[index] = cachedAtom2
        return
      }

      var read2 = function read2(get2) {
        var index2 =
          currentKeyList == null ? void 0 : currentKeyList.indexOf(key)

        if (index2 === void 0 || index2 === -1) {
          throw new Error('index not found')
        }

        return get2(arrAtom)[index2]
      }

      var write2 = function write2(get2, set, update) {
        var index2 =
          currentKeyList == null ? void 0 : currentKeyList.indexOf(key)

        if (index2 === void 0 || index2 === -1) {
          throw new Error('index not found')
        }

        var prev = get2(arrAtom)
        var nextItem = isFunction(update) ? update(prev[index2]) : update
        set(
          arrAtom,
          [].concat(prev.slice(0, index2), [nextItem], prev.slice(index2 + 1))
        )
      }

      var itemAtom = isWritable(arrAtom)
        ? jotai.atom(read2, write2)
        : jotai.atom(read2)
      nextAtomList[index] = itemAtom
    })
    currentKeyList = nextKeyList

    if (
      currentAtomList &&
      currentAtomList.length === nextAtomList.length &&
      currentAtomList.every(function (x, i) {
        return x === nextAtomList[i]
      })
    ) {
      return currentAtomList
    }

    return (currentAtomList = nextAtomList)
  }

  var write = function write(get, set, atomToRemove) {
    var index = get(splittedAtom).indexOf(atomToRemove)

    if (index >= 0) {
      var prev = get(arrAtom)
      set(arrAtom, [].concat(prev.slice(0, index), prev.slice(index + 1)))
    }
  }

  var splittedAtom = isWritable(arrAtom)
    ? jotai.atom(read, write)
    : jotai.atom(read)
  setWeakCacheItem(splitAtomCache, deps, splittedAtom)
  return splittedAtom
}

exports.RESET = RESET
exports.atomFamily = atomFamily
exports.atomFrozenInDev = atomFrozenInDev
exports.atomWithReducer = atomWithReducer
exports.atomWithReset = atomWithReset
exports.freezeAtom = freezeAtom
exports.selectAtom = selectAtom
exports.splitAtom = splitAtom
exports.useAtomCallback = useAtomCallback
exports.useAtomValue = useAtomValue
exports.useReducerAtom = useReducerAtom
exports.useResetAtom = useResetAtom
exports.useUpdateAtom = useUpdateAtom
