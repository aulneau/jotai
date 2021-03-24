'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var react = require('react')

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

var __defProp$1 = Object.defineProperty
var __hasOwnProp$1 = Object.prototype.hasOwnProperty
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable

var __defNormalProp$1 = function __defNormalProp(obj, key, value) {
  return key in obj
    ? __defProp$1(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value,
      })
    : (obj[key] = value)
}

var __assign$1 = function __assign(a, b) {
  for (var prop in b || (b = {})) {
    if (__hasOwnProp$1.call(b, prop)) __defNormalProp$1(a, prop, b[prop])
  }

  if (__getOwnPropSymbols$1) {
    for (
      var _iterator = _createForOfIteratorHelperLoose$1(
          __getOwnPropSymbols$1(b)
        ),
        _step;
      !(_step = _iterator()).done;

    ) {
      var prop = _step.value
      if (__propIsEnum$1.call(b, prop)) __defNormalProp$1(a, prop, b[prop])
    }
  }

  return a
}

var hasInitialValue = function hasInitialValue(atom) {
  return 'init' in atom
}

var createState = function createState(initialValues, newAtomReceiver) {
  var state = {
    n: newAtomReceiver,
    v: 0,
    a: new WeakMap(),
    m: new WeakMap(),
    p: new Set(),
  }

  if (initialValues) {
    for (
      var _iterator2 = _createForOfIteratorHelperLoose$1(initialValues), _step2;
      !(_step2 = _iterator2()).done;

    ) {
      var _step2$value = _step2.value,
        atom = _step2$value[0],
        value = _step2$value[1]
      var atomState = {
        v: value,
        r: 0,
        d: new Map(),
      }

      if (
        typeof process === 'object' &&
        process.env.NODE_ENV !== 'production'
      ) {
        Object.freeze(atomState)
      }

      state.a.set(atom, atomState)
    }
  }

  return state
}

var getAtomState = function getAtomState(state, atom) {
  return state.a.get(atom)
}

var wipAtomState = function wipAtomState(state, atom, dependencies) {
  var atomState = getAtomState(state, atom)

  var nextAtomState = __assign$1(
    __assign$1(
      {
        r: 0,
      },
      atomState
    ),
    {
      d: dependencies
        ? new Map(
            Array.from(dependencies).map(function (a) {
              var _a, _b

              return [
                a,
                (_b = (_a = getAtomState(state, a)) == null ? void 0 : _a.r) !=
                null
                  ? _b
                  : 0,
              ]
            })
          )
        : atomState
        ? atomState.d
        : new Map(),
    }
  )

  if (!atomState && hasInitialValue(atom)) {
    nextAtomState.v = atom.init
  }

  return [nextAtomState, atomState == null ? void 0 : atomState.d]
}

var setAtomValue = function setAtomValue(
  state,
  atom,
  value,
  dependencies,
  promise
) {
  var _wipAtomState = wipAtomState(state, atom, dependencies),
    atomState = _wipAtomState[0],
    prevDependencies = _wipAtomState[1]

  if (promise && promise !== (atomState == null ? void 0 : atomState.p)) {
    return
  }

  delete atomState.e
  delete atomState.p
  delete atomState.i

  if (!('v' in atomState) || !Object.is(atomState.v, value)) {
    atomState.v = value
    ++atomState.r
  }

  commitAtomState(state, atom, atomState)
  mountDependencies(state, atom, atomState, prevDependencies)
}

var setAtomReadError = function setAtomReadError(
  state,
  atom,
  error,
  dependencies,
  promise
) {
  var _wipAtomState2 = wipAtomState(state, atom, dependencies),
    atomState = _wipAtomState2[0],
    prevDependencies = _wipAtomState2[1]

  if (promise && promise !== (atomState == null ? void 0 : atomState.p)) {
    return
  }

  delete atomState.p
  delete atomState.i
  atomState.e = error
  commitAtomState(state, atom, atomState)
  mountDependencies(state, atom, atomState, prevDependencies)
}

var setAtomReadPromise = function setAtomReadPromise(
  state,
  atom,
  promise,
  dependencies
) {
  var _wipAtomState3 = wipAtomState(state, atom, dependencies),
    atomState = _wipAtomState3[0],
    prevDependencies = _wipAtomState3[1]

  atomState.p = promise
  commitAtomState(state, atom, atomState)
  mountDependencies(state, atom, atomState, prevDependencies)
}

var setAtomInvalidated = function setAtomInvalidated(state, atom) {
  var _wipAtomState4 = wipAtomState(state, atom),
    atomState = _wipAtomState4[0]

  atomState.i = atomState.r
  commitAtomState(state, atom, atomState)
}

var setAtomWritePromise = function setAtomWritePromise(state, atom, promise) {
  var _wipAtomState5 = wipAtomState(state, atom),
    atomState = _wipAtomState5[0]

  if (promise) {
    atomState.w = promise
  } else {
    delete atomState.w
  }

  commitAtomState(state, atom, atomState)
}

var scheduleReadAtomState = function scheduleReadAtomState(
  state,
  atom,
  promise
) {
  promise.then(function () {
    readAtomState(state, atom, true)
  })
}

var readAtomState = function readAtomState(state, atom, force) {
  if (!force) {
    var atomState = getAtomState(state, atom)

    if (atomState) {
      atomState.d.forEach(function (_, a) {
        if (a !== atom) {
          var aState = getAtomState(state, a)

          if (aState && !aState.e && !aState.p && aState.r === aState.i) {
            readAtomState(state, a, true)
          }
        }
      })

      if (
        Array.from(atomState.d.entries()).every(function (_ref) {
          var a = _ref[0],
            r = _ref[1]
          var aState = getAtomState(state, a)
          return (
            aState &&
            !aState.e &&
            !aState.p &&
            aState.r !== aState.i &&
            aState.r === r
          )
        })
      ) {
        return atomState
      }
    }
  }

  var error
  var promise
  var value
  var dependencies = new Set()

  try {
    var promiseOrValue = atom.read(function (a) {
      dependencies.add(a)

      if (a !== atom) {
        var aState2 = readAtomState(state, a)

        if (aState2.e) {
          throw aState2.e
        }

        if (aState2.p) {
          throw aState2.p
        }

        return aState2.v
      }

      var aState = getAtomState(state, a)

      if (aState) {
        if (aState.p) {
          throw aState.p
        }

        return aState.v
      }

      if (hasInitialValue(a)) {
        return a.init
      }

      throw new Error('no atom init')
    })

    if (promiseOrValue instanceof Promise) {
      promise = promiseOrValue
        .then(function (value2) {
          setAtomValue(state, atom, value2, dependencies, promise)
          flushPending(state)
        })
        .catch(function (e) {
          if (e instanceof Promise) {
            scheduleReadAtomState(state, atom, e)
            return e
          }

          setAtomReadError(
            state,
            atom,
            e instanceof Error ? e : new Error(e),
            dependencies,
            promise
          )
          flushPending(state)
        })
    } else {
      value = promiseOrValue
    }
  } catch (errorOrPromise) {
    if (errorOrPromise instanceof Promise) {
      scheduleReadAtomState(state, atom, errorOrPromise)
      promise = errorOrPromise
    } else if (errorOrPromise instanceof Error) {
      error = errorOrPromise
    } else {
      error = new Error(errorOrPromise)
    }
  }

  if (error) {
    setAtomReadError(state, atom, error, dependencies)
  } else if (promise) {
    setAtomReadPromise(state, atom, promise, dependencies)
  } else {
    setAtomValue(state, atom, value, dependencies)
  }

  return getAtomState(state, atom)
}

var readAtom = function readAtom(state, readingAtom) {
  var atomState = readAtomState(state, readingAtom)
  state.p.delete(readingAtom)
  flushPending(state)
  return atomState
}

var addAtom = function addAtom(state, addingAtom) {
  var mounted = state.m.get(addingAtom)

  if (!mounted) {
    mounted = mountAtom(state, addingAtom)
  }

  flushPending(state)
  return mounted
}

var canUnmountAtom = function canUnmountAtom(atom, mounted) {
  return (
    !mounted.l.size &&
    (!mounted.d.size || (mounted.d.size === 1 && mounted.d.has(atom)))
  )
}

var delAtom = function delAtom(state, deletingAtom) {
  var mounted = state.m.get(deletingAtom)

  if (mounted && canUnmountAtom(deletingAtom, mounted)) {
    unmountAtom(state, deletingAtom)
  }

  flushPending(state)
}

var invalidateDependents = function invalidateDependents(state, atom) {
  var mounted = state.m.get(atom)
  mounted == null
    ? void 0
    : mounted.d.forEach(function (dependent) {
        if (dependent === atom) {
          return
        }

        setAtomInvalidated(state, dependent)
        invalidateDependents(state, dependent)
      })
}

var writeAtomState = function writeAtomState(
  state,
  atom,
  update,
  pendingPromises
) {
  var atomState = getAtomState(state, atom)

  if (atomState && atomState.w) {
    var promise = atomState.w.then(function () {
      writeAtomState(state, atom, update)
      flushPending(state)
    })

    if (pendingPromises) {
      pendingPromises.push(promise)
    }

    return
  }

  try {
    var promiseOrVoid = atom.write(
      function (a) {
        var aState = readAtomState(state, a)

        if (aState.e) {
          throw aState.e
        }

        if (aState.p) {
          if (
            typeof process === 'object' &&
            process.env.NODE_ENV !== 'production'
          ) {
            console.warn(
              'Reading pending atom state in write operation. We throw a promise for now.',
              a
            )
          }

          throw aState.p
        }

        if ('v' in aState) {
          return aState.v
        }

        if (
          typeof process === 'object' &&
          process.env.NODE_ENV !== 'production'
        ) {
          console.warn(
            '[Bug] no value found while reading atom in write operation. This probably a bug.',
            a
          )
        }

        throw new Error('no value found')
      },
      function (a, v) {
        if (a === atom) {
          setAtomValue(state, a, v)
          invalidateDependents(state, a)
        } else {
          writeAtomState(state, a, v)
        }
      },
      update
    )

    if (promiseOrVoid instanceof Promise) {
      if (pendingPromises) {
        pendingPromises.push(promiseOrVoid)
      }

      setAtomWritePromise(
        state,
        atom,
        promiseOrVoid.then(function () {
          setAtomWritePromise(state, atom)
          flushPending(state)
        })
      )
    }
  } catch (e) {
    if (pendingPromises && pendingPromises.length) {
      pendingPromises.push(
        new Promise(function (_resolve, reject) {
          reject(e)
        })
      )
    } else {
      throw e
    }
  }
}

var writeAtom = function writeAtom(state, writingAtom, update) {
  var pendingPromises = []
  writeAtomState(state, writingAtom, update, pendingPromises)
  flushPending(state)

  if (pendingPromises.length) {
    return new Promise(function (resolve, reject) {
      var loop = function loop() {
        var len = pendingPromises.length

        if (len === 0) {
          resolve()
        } else {
          Promise.all(pendingPromises)
            .then(function () {
              pendingPromises.splice(0, len)
              loop()
            })
            .catch(reject)
        }
      }

      loop()
    })
  }
}

var isActuallyWritableAtom = function isActuallyWritableAtom(atom) {
  return !!atom.write
}

var mountAtom = function mountAtom(state, atom, initialDependent) {
  var atomState = getAtomState(state, atom)

  if (atomState) {
    atomState.d.forEach(function (_, a) {
      if (a !== atom) {
        if (!state.m.has(a)) {
          mountAtom(state, a, atom)
        }
      }
    })
  } else if (
    typeof process === 'object' &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.warn('[Bug] could not find atom state to mount', atom)
  }

  var mounted = {
    d: new Set(initialDependent && [initialDependent]),
    l: new Set(),
    u: void 0,
  }
  state.m.set(atom, mounted)

  if (isActuallyWritableAtom(atom) && atom.onMount) {
    var setAtom = function setAtom(update) {
      return writeAtom(state, atom, update)
    }

    mounted.u = atom.onMount(setAtom)
  }

  return mounted
}

var unmountAtom = function unmountAtom(state, atom) {
  var _a

  var onUnmount = (_a = state.m.get(atom)) == null ? void 0 : _a.u

  if (onUnmount) {
    onUnmount()
  }

  state.m.delete(atom)
  var atomState = getAtomState(state, atom)

  if (atomState) {
    if (
      atomState.p &&
      typeof process === 'object' &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn('[Bug] deleting atomState with read promise', atom)
    }

    atomState.d.forEach(function (_, a) {
      if (a !== atom) {
        var mounted = state.m.get(a)

        if (mounted) {
          mounted.d.delete(atom)

          if (canUnmountAtom(a, mounted)) {
            unmountAtom(state, a)
          }
        }
      }
    })
  } else if (
    typeof process === 'object' &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.warn('[Bug] could not find atom state to unmount', atom)
  }
}

var mountDependencies = function mountDependencies(
  state,
  atom,
  atomState,
  prevDependencies
) {
  if (prevDependencies !== atomState.d) {
    var dependencies = new Set(atomState.d.keys())

    if (prevDependencies) {
      prevDependencies.forEach(function (_, a) {
        var mounted = state.m.get(a)

        if (dependencies.has(a)) {
          dependencies.delete(a)
        } else if (mounted) {
          mounted.d.delete(atom)

          if (canUnmountAtom(a, mounted)) {
            unmountAtom(state, a)
          }
        } else if (
          typeof process === 'object' &&
          process.env.NODE_ENV !== 'production'
        ) {
          console.warn('[Bug] a dependency is not mounted', a)
        }
      })
    }

    dependencies.forEach(function (a) {
      var mounted = state.m.get(a)

      if (mounted) {
        var dependents = mounted.d
        dependents.add(atom)
      } else {
        mountAtom(state, a, atom)
      }
    })
  }
}

var commitAtomState = function commitAtomState(state, atom, atomState) {
  if (typeof process === 'object' && process.env.NODE_ENV !== 'production') {
    Object.freeze(atomState)
  }

  var isNewAtom = state.n && !state.a.has(atom)
  state.a.set(atom, atomState)

  if (isNewAtom) {
    state.n(atom)
  }

  ++state.v
  state.p.add(atom)
}

var flushPending = function flushPending(state) {
  state.p.forEach(function (atom) {
    var mounted = state.m.get(atom)
    mounted == null
      ? void 0
      : mounted.l.forEach(function (listener) {
          return listener()
        })
  })
  state.p.clear()
}

var subscribeAtom = function subscribeAtom(state, atom, callback) {
  var mounted = addAtom(state, atom)
  var listeners = mounted.l
  listeners.add(callback)
  return function () {
    listeners.delete(callback)
    delAtom(state, atom)
  }
}

var TARGET = Symbol()
var GET_VERSION = Symbol()
var createMutableSource = function createMutableSource(target, getVersion) {
  var _ref

  return (
    (_ref = {}), (_ref[TARGET] = target), (_ref[GET_VERSION] = getVersion), _ref
  )
}
var useMutableSource = function useMutableSource(
  source,
  getSnapshot,
  subscribe
) {
  var lastVersion = react.useRef(0)
  var currentVersion = source[GET_VERSION](source[TARGET])

  var _useState = react.useState(function () {
      return [
        source,
        getSnapshot,
        subscribe,
        currentVersion,
        getSnapshot(source[TARGET]),
      ]
    }),
    state = _useState[0],
    setState = _useState[1]

  var currentSnapshot = state[4]

  if (
    state[0] !== source ||
    state[1] !== getSnapshot ||
    state[2] !== subscribe ||
    (currentVersion !== state[3] && currentVersion !== lastVersion.current)
  ) {
    currentSnapshot = getSnapshot(source[TARGET])
    setState([source, getSnapshot, subscribe, currentVersion, currentSnapshot])
  }

  react.useEffect(
    function () {
      var didUnsubscribe = false

      var checkForUpdates = function checkForUpdates() {
        if (didUnsubscribe) {
          return
        }

        try {
          var nextSnapshot = getSnapshot(source[TARGET])
          var nextVersion = source[GET_VERSION](source[TARGET])
          lastVersion.current = nextVersion
          setState(function (prev) {
            if (
              prev[0] !== source ||
              prev[1] !== getSnapshot ||
              prev[2] !== subscribe
            ) {
              return prev
            }

            if (prev[4] === nextSnapshot) {
              return prev
            }

            return [prev[0], prev[1], prev[2], nextVersion, nextSnapshot]
          })
        } catch (e) {
          setState(function (prev) {
            return [].concat(prev)
          })
        }
      }

      var unsubscribe = subscribe(source[TARGET], checkForUpdates)
      checkForUpdates()
      return function () {
        didUnsubscribe = true
        unsubscribe()
      }
    },
    [source, getSnapshot, subscribe]
  )
  return currentSnapshot
}

var createStore = function createStore(initialValues, newAtomReceiver) {
  var state = createState(initialValues, newAtomReceiver)
  var mutableSource = createMutableSource(state, function () {
    return state.v
  })

  var updateAtom = function updateAtom(atom, update) {
    return writeAtom(state, atom, update)
  }

  return [mutableSource, updateAtom]
}
var StoreContextMap = new Map()
var getStoreContext = function getStoreContext(scope) {
  if (!StoreContextMap.has(scope)) {
    StoreContextMap.set(scope, react.createContext(createStore()))
  }

  return StoreContextMap.get(scope)
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

var __defProp = Object.defineProperty
var __hasOwnProp = Object.prototype.hasOwnProperty
var __getOwnPropSymbols = Object.getOwnPropertySymbols
var __propIsEnum = Object.prototype.propertyIsEnumerable

var __defNormalProp = function __defNormalProp(obj, key, value) {
  return key in obj
    ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value,
      })
    : (obj[key] = value)
}

var __assign = function __assign(a, b) {
  for (var prop in b || (b = {})) {
    if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop])
  }

  if (__getOwnPropSymbols) {
    for (
      var _iterator = _createForOfIteratorHelperLoose(__getOwnPropSymbols(b)),
        _step;
      !(_step = _iterator()).done;

    ) {
      var prop = _step.value
      if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop])
    }
  }

  return a
}
var Provider = function Provider(_ref) {
  var initialValues = _ref.initialValues,
    scope = _ref.scope,
    children = _ref.children
  var storeRef = react.useRef(null)

  if (
    typeof process === 'object' &&
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test'
  ) {
    var atomsRef = react.useRef([])

    if (storeRef.current === null) {
      storeRef.current = createStore(initialValues, function (newAtom) {
        atomsRef.current.push(newAtom)
      })
    }

    useDebugState(storeRef.current, atomsRef.current)
  } else {
    if (storeRef.current === null) {
      storeRef.current = createStore(initialValues)
    }
  }

  var StoreContext = getStoreContext(scope)
  return react.createElement(
    StoreContext.Provider,
    {
      value: storeRef.current,
    },
    children
  )
}

var atomToPrintable = function atomToPrintable(atom) {
  return atom.debugLabel || atom.toString()
}

var stateToPrintable = function stateToPrintable(_ref2) {
  var state = _ref2[0],
    atoms = _ref2[1]
  return Object.fromEntries(
    atoms.flatMap(function (atom) {
      var mounted = state.m.get(atom)

      if (!mounted) {
        return []
      }

      var dependents = mounted.d
      var atomState = state.a.get(atom) || {}
      return [
        [
          atomToPrintable(atom),
          {
            value: atomState.e || atomState.p || atomState.w || atomState.v,
            dependents: Array.from(dependents).map(atomToPrintable),
          },
        ],
      ]
    })
  )
}

var getState = function getState(state) {
  return __assign({}, state)
}

var useDebugState = function useDebugState(store, atoms) {
  var subscribe = react.useCallback(
    function (state2, callback) {
      var unsubs = atoms.map(function (atom) {
        return subscribeAtom(state2, atom, callback)
      })
      return function () {
        unsubs.forEach(function (unsub) {
          return unsub()
        })
      }
    },
    [atoms]
  )
  var state = useMutableSource(store[0], getState, subscribe)
  react.useDebugValue([state, atoms], stateToPrintable)
}

var keyCount = 0
function atom(read, write) {
  var key = 'atom' + ++keyCount
  var config = {
    toString: function toString() {
      return key
    },
  }

  if (typeof read === 'function') {
    config.read = read
  } else {
    config.init = read

    config.read = function (get) {
      return get(config)
    }

    config.write = function (get, set, update) {
      set(config, typeof update === 'function' ? update(get(config)) : update)
    }
  }

  if (write) {
    config.write = write
  }

  return config
}

var isWritable = function isWritable(atom) {
  return !!atom.write
}

function useAtom(atom) {
  var getAtomValue = react.useCallback(
    function (state) {
      var atomState = readAtom(state, atom)

      if (atomState.e) {
        throw atomState.e
      }

      if (atomState.p) {
        throw atomState.p
      }

      if (atomState.w) {
        throw atomState.w
      }

      if ('v' in atomState) {
        return atomState.v
      }

      throw new Error('no atom value')
    },
    [atom]
  )
  var subscribe = react.useCallback(
    function (state, callback) {
      return subscribeAtom(state, atom, callback)
    },
    [atom]
  )
  var StoreContext = getStoreContext(atom.scope)

  var _useContext = react.useContext(StoreContext),
    mutableSource = _useContext[0],
    updateAtom = _useContext[1]

  var value = useMutableSource(mutableSource, getAtomValue, subscribe)
  var setAtom = react.useCallback(
    function (update) {
      if (isWritable(atom)) {
        return updateAtom(atom, update)
      } else {
        throw new Error('not writable atom')
      }
    },
    [updateAtom, atom]
  )
  react.useDebugValue(value)
  return [value, setAtom]
}

exports.Provider = Provider
exports.SECRET_INTERNAL_getStoreContext = getStoreContext
exports.atom = atom
exports.useAtom = useAtom
