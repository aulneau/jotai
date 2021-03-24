import {
  useRef,
  useState,
  useEffect,
  createContext,
  createElement,
  useCallback,
  useDebugValue,
  useContext,
} from 'react'

var __defProp$1 = Object.defineProperty
var __hasOwnProp$1 = Object.prototype.hasOwnProperty
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable
var __defNormalProp$1 = (obj, key, value) =>
  key in obj
    ? __defProp$1(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value,
      })
    : (obj[key] = value)
var __assign$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop)) __defNormalProp$1(a, prop, b[prop])
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop)) __defNormalProp$1(a, prop, b[prop])
    }
  return a
}
const hasInitialValue = (atom) => 'init' in atom
const createState = (initialValues, newAtomReceiver) => {
  const state = {
    n: newAtomReceiver,
    v: 0,
    a: new WeakMap(),
    m: new WeakMap(),
    p: new Set(),
  }
  if (initialValues) {
    for (const [atom, value] of initialValues) {
      const atomState = { v: value, r: 0, d: new Map() }
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
const getAtomState = (state, atom) => state.a.get(atom)
const wipAtomState = (state, atom, dependencies) => {
  const atomState = getAtomState(state, atom)
  const nextAtomState = __assign$1(
    __assign$1(
      {
        r: 0,
      },
      atomState
    ),
    {
      d: dependencies
        ? new Map(
            Array.from(dependencies).map((a) => {
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
const setAtomValue = (state, atom, value, dependencies, promise) => {
  const [atomState, prevDependencies] = wipAtomState(state, atom, dependencies)
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
const setAtomReadError = (state, atom, error, dependencies, promise) => {
  const [atomState, prevDependencies] = wipAtomState(state, atom, dependencies)
  if (promise && promise !== (atomState == null ? void 0 : atomState.p)) {
    return
  }
  delete atomState.p
  delete atomState.i
  atomState.e = error
  commitAtomState(state, atom, atomState)
  mountDependencies(state, atom, atomState, prevDependencies)
}
const setAtomReadPromise = (state, atom, promise, dependencies) => {
  const [atomState, prevDependencies] = wipAtomState(state, atom, dependencies)
  atomState.p = promise
  commitAtomState(state, atom, atomState)
  mountDependencies(state, atom, atomState, prevDependencies)
}
const setAtomInvalidated = (state, atom) => {
  const [atomState] = wipAtomState(state, atom)
  atomState.i = atomState.r
  commitAtomState(state, atom, atomState)
}
const setAtomWritePromise = (state, atom, promise) => {
  const [atomState] = wipAtomState(state, atom)
  if (promise) {
    atomState.w = promise
  } else {
    delete atomState.w
  }
  commitAtomState(state, atom, atomState)
}
const scheduleReadAtomState = (state, atom, promise) => {
  promise.then(() => {
    readAtomState(state, atom, true)
  })
}
const readAtomState = (state, atom, force) => {
  if (!force) {
    const atomState = getAtomState(state, atom)
    if (atomState) {
      atomState.d.forEach((_, a) => {
        if (a !== atom) {
          const aState = getAtomState(state, a)
          if (aState && !aState.e && !aState.p && aState.r === aState.i) {
            readAtomState(state, a, true)
          }
        }
      })
      if (
        Array.from(atomState.d.entries()).every(([a, r]) => {
          const aState = getAtomState(state, a)
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
  let error
  let promise
  let value
  const dependencies = new Set()
  try {
    const promiseOrValue = atom.read((a) => {
      dependencies.add(a)
      if (a !== atom) {
        const aState2 = readAtomState(state, a)
        if (aState2.e) {
          throw aState2.e
        }
        if (aState2.p) {
          throw aState2.p
        }
        return aState2.v
      }
      const aState = getAtomState(state, a)
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
        .then((value2) => {
          setAtomValue(state, atom, value2, dependencies, promise)
          flushPending(state)
        })
        .catch((e) => {
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
const readAtom = (state, readingAtom) => {
  const atomState = readAtomState(state, readingAtom)
  state.p.delete(readingAtom)
  flushPending(state)
  return atomState
}
const addAtom = (state, addingAtom) => {
  let mounted = state.m.get(addingAtom)
  if (!mounted) {
    mounted = mountAtom(state, addingAtom)
  }
  flushPending(state)
  return mounted
}
const canUnmountAtom = (atom, mounted) =>
  !mounted.l.size &&
  (!mounted.d.size || (mounted.d.size === 1 && mounted.d.has(atom)))
const delAtom = (state, deletingAtom) => {
  const mounted = state.m.get(deletingAtom)
  if (mounted && canUnmountAtom(deletingAtom, mounted)) {
    unmountAtom(state, deletingAtom)
  }
  flushPending(state)
}
const invalidateDependents = (state, atom) => {
  const mounted = state.m.get(atom)
  mounted == null
    ? void 0
    : mounted.d.forEach((dependent) => {
        if (dependent === atom) {
          return
        }
        setAtomInvalidated(state, dependent)
        invalidateDependents(state, dependent)
      })
}
const writeAtomState = (state, atom, update, pendingPromises) => {
  const atomState = getAtomState(state, atom)
  if (atomState && atomState.w) {
    const promise = atomState.w.then(() => {
      writeAtomState(state, atom, update)
      flushPending(state)
    })
    if (pendingPromises) {
      pendingPromises.push(promise)
    }
    return
  }
  try {
    const promiseOrVoid = atom.write(
      (a) => {
        const aState = readAtomState(state, a)
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
      (a, v) => {
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
        promiseOrVoid.then(() => {
          setAtomWritePromise(state, atom)
          flushPending(state)
        })
      )
    }
  } catch (e) {
    if (pendingPromises && pendingPromises.length) {
      pendingPromises.push(
        new Promise((_resolve, reject) => {
          reject(e)
        })
      )
    } else {
      throw e
    }
  }
}
const writeAtom = (state, writingAtom, update) => {
  const pendingPromises = []
  writeAtomState(state, writingAtom, update, pendingPromises)
  flushPending(state)
  if (pendingPromises.length) {
    return new Promise((resolve, reject) => {
      const loop = () => {
        const len = pendingPromises.length
        if (len === 0) {
          resolve()
        } else {
          Promise.all(pendingPromises)
            .then(() => {
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
const isActuallyWritableAtom = (atom) => !!atom.write
const mountAtom = (state, atom, initialDependent) => {
  const atomState = getAtomState(state, atom)
  if (atomState) {
    atomState.d.forEach((_, a) => {
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
  const mounted = {
    d: new Set(initialDependent && [initialDependent]),
    l: new Set(),
    u: void 0,
  }
  state.m.set(atom, mounted)
  if (isActuallyWritableAtom(atom) && atom.onMount) {
    const setAtom = (update) => writeAtom(state, atom, update)
    mounted.u = atom.onMount(setAtom)
  }
  return mounted
}
const unmountAtom = (state, atom) => {
  var _a
  const onUnmount = (_a = state.m.get(atom)) == null ? void 0 : _a.u
  if (onUnmount) {
    onUnmount()
  }
  state.m.delete(atom)
  const atomState = getAtomState(state, atom)
  if (atomState) {
    if (
      atomState.p &&
      typeof process === 'object' &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn('[Bug] deleting atomState with read promise', atom)
    }
    atomState.d.forEach((_, a) => {
      if (a !== atom) {
        const mounted = state.m.get(a)
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
const mountDependencies = (state, atom, atomState, prevDependencies) => {
  if (prevDependencies !== atomState.d) {
    const dependencies = new Set(atomState.d.keys())
    if (prevDependencies) {
      prevDependencies.forEach((_, a) => {
        const mounted = state.m.get(a)
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
    dependencies.forEach((a) => {
      const mounted = state.m.get(a)
      if (mounted) {
        const dependents = mounted.d
        dependents.add(atom)
      } else {
        mountAtom(state, a, atom)
      }
    })
  }
}
const commitAtomState = (state, atom, atomState) => {
  if (typeof process === 'object' && process.env.NODE_ENV !== 'production') {
    Object.freeze(atomState)
  }
  const isNewAtom = state.n && !state.a.has(atom)
  state.a.set(atom, atomState)
  if (isNewAtom) {
    state.n(atom)
  }
  ++state.v
  state.p.add(atom)
}
const flushPending = (state) => {
  state.p.forEach((atom) => {
    const mounted = state.m.get(atom)
    mounted == null ? void 0 : mounted.l.forEach((listener) => listener())
  })
  state.p.clear()
}
const subscribeAtom = (state, atom, callback) => {
  const mounted = addAtom(state, atom)
  const listeners = mounted.l
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
    delAtom(state, atom)
  }
}

const TARGET = Symbol()
const GET_VERSION = Symbol()
const createMutableSource = (target, getVersion) => ({
  [TARGET]: target,
  [GET_VERSION]: getVersion,
})
const useMutableSource = (source, getSnapshot, subscribe) => {
  const lastVersion = useRef(0)
  const currentVersion = source[GET_VERSION](source[TARGET])
  const [state, setState] = useState(() => [
    source,
    getSnapshot,
    subscribe,
    currentVersion,
    getSnapshot(source[TARGET]),
  ])
  let currentSnapshot = state[4]
  if (
    state[0] !== source ||
    state[1] !== getSnapshot ||
    state[2] !== subscribe ||
    (currentVersion !== state[3] && currentVersion !== lastVersion.current)
  ) {
    currentSnapshot = getSnapshot(source[TARGET])
    setState([source, getSnapshot, subscribe, currentVersion, currentSnapshot])
  }
  useEffect(() => {
    let didUnsubscribe = false
    const checkForUpdates = () => {
      if (didUnsubscribe) {
        return
      }
      try {
        const nextSnapshot = getSnapshot(source[TARGET])
        const nextVersion = source[GET_VERSION](source[TARGET])
        lastVersion.current = nextVersion
        setState((prev) => {
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
        setState((prev) => [...prev])
      }
    }
    const unsubscribe = subscribe(source[TARGET], checkForUpdates)
    checkForUpdates()
    return () => {
      didUnsubscribe = true
      unsubscribe()
    }
  }, [source, getSnapshot, subscribe])
  return currentSnapshot
}

const createStore = (initialValues, newAtomReceiver) => {
  const state = createState(initialValues, newAtomReceiver)
  const mutableSource = createMutableSource(state, () => state.v)
  const updateAtom = (atom, update) => writeAtom(state, atom, update)
  return [mutableSource, updateAtom]
}
const StoreContextMap = new Map()
const getStoreContext = (scope) => {
  if (!StoreContextMap.has(scope)) {
    StoreContextMap.set(scope, createContext(createStore()))
  }
  return StoreContextMap.get(scope)
}

var __defProp = Object.defineProperty
var __hasOwnProp = Object.prototype.hasOwnProperty
var __getOwnPropSymbols = Object.getOwnPropertySymbols
var __propIsEnum = Object.prototype.propertyIsEnumerable
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value,
      })
    : (obj[key] = value)
var __assign = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop])
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop])
    }
  return a
}
const Provider = ({ initialValues, scope, children }) => {
  const storeRef = useRef(null)
  if (
    typeof process === 'object' &&
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test'
  ) {
    const atomsRef = useRef([])
    if (storeRef.current === null) {
      storeRef.current = createStore(initialValues, (newAtom) => {
        atomsRef.current.push(newAtom)
      })
    }
    useDebugState(storeRef.current, atomsRef.current)
  } else {
    if (storeRef.current === null) {
      storeRef.current = createStore(initialValues)
    }
  }
  const StoreContext = getStoreContext(scope)
  return createElement(
    StoreContext.Provider,
    { value: storeRef.current },
    children
  )
}
const atomToPrintable = (atom) => atom.debugLabel || atom.toString()
const stateToPrintable = ([state, atoms]) =>
  Object.fromEntries(
    atoms.flatMap((atom) => {
      const mounted = state.m.get(atom)
      if (!mounted) {
        return []
      }
      const dependents = mounted.d
      const atomState = state.a.get(atom) || {}
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
const getState = (state) => __assign({}, state)
const useDebugState = (store, atoms) => {
  const subscribe = useCallback(
    (state2, callback) => {
      const unsubs = atoms.map((atom) => subscribeAtom(state2, atom, callback))
      return () => {
        unsubs.forEach((unsub) => unsub())
      }
    },
    [atoms]
  )
  const state = useMutableSource(store[0], getState, subscribe)
  useDebugValue([state, atoms], stateToPrintable)
}

let keyCount = 0
function atom(read, write) {
  const key = `atom${++keyCount}`
  const config = {
    toString: () => key,
  }
  if (typeof read === 'function') {
    config.read = read
  } else {
    config.init = read
    config.read = (get) => get(config)
    config.write = (get, set, update) => {
      set(config, typeof update === 'function' ? update(get(config)) : update)
    }
  }
  if (write) {
    config.write = write
  }
  return config
}

const isWritable = (atom) => !!atom.write
function useAtom(atom) {
  const getAtomValue = useCallback(
    (state) => {
      const atomState = readAtom(state, atom)
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
  const subscribe = useCallback(
    (state, callback) => subscribeAtom(state, atom, callback),
    [atom]
  )
  const StoreContext = getStoreContext(atom.scope)
  const [mutableSource, updateAtom] = useContext(StoreContext)
  const value = useMutableSource(mutableSource, getAtomValue, subscribe)
  const setAtom = useCallback(
    (update) => {
      if (isWritable(atom)) {
        return updateAtom(atom, update)
      } else {
        throw new Error('not writable atom')
      }
    },
    [updateAtom, atom]
  )
  useDebugValue(value)
  return [value, setAtom]
}

export {
  Provider,
  getStoreContext as SECRET_INTERNAL_getStoreContext,
  atom,
  useAtom,
}
