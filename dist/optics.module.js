import { atom } from 'jotai'
import { optic, modify, set, collect, preview, get } from 'optics-ts'

const getWeakCacheItem = (cache, deps) => {
  const [dep, ...rest] = deps
  const entry = cache.get(dep)
  if (!entry) {
    return
  }
  if (!rest.length) {
    return entry[1]
  }
  return getWeakCacheItem(entry[0], rest)
}
const setWeakCacheItem = (cache, deps, item) => {
  const [dep, ...rest] = deps
  let entry = cache.get(dep)
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

const focusAtomCache = new WeakMap()
const isFunction = (x) => typeof x === 'function'
function focusAtom(baseAtom, callback) {
  const deps = [baseAtom, callback]
  const cachedAtom = getWeakCacheItem(focusAtomCache, deps)
  if (cachedAtom) {
    return cachedAtom
  }
  const focus = callback(optic())
  const derivedAtom = atom(
    (get) => {
      const newValue = getValueUsingOptic(focus, get(baseAtom))
      return newValue
    },
    (_, set$1, update) => {
      const newValueProducer = isFunction(update)
        ? modify(focus)(update)
        : set(focus)(update)
      set$1(baseAtom, newValueProducer)
    }
  )
  derivedAtom.scope = baseAtom.scope
  setWeakCacheItem(focusAtomCache, deps, derivedAtom)
  return derivedAtom
}
const getValueUsingOptic = (focus, bigValue) => {
  if (focus._tag === 'Traversal') {
    const values = collect(focus)(bigValue)
    return values
  }
  if (focus._tag === 'Prism') {
    const value2 = preview(focus)(bigValue)
    return value2
  }
  const value = get(focus)(bigValue)
  return value
}

export { focusAtom }
