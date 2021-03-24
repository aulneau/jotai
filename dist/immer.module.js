import { produce } from 'immer'
import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

function atomWithImmer(initialValue) {
  const anAtom = atom(initialValue, (get, set, fn) =>
    set(
      anAtom,
      produce(get(anAtom), (draft) => fn(draft))
    )
  )
  return anAtom
}

function useImmerAtom(anAtom) {
  const [state, setState] = useAtom(anAtom)
  const setStateWithImmer = useCallback(
    (fn) => {
      setState(produce((draft) => fn(draft)))
    },
    [setState]
  )
  return [state, setStateWithImmer]
}

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

const withImmerCache = new WeakMap()
function withImmer(anAtom) {
  const deps = [anAtom]
  const cachedAtom = getWeakCacheItem(withImmerCache, deps)
  if (cachedAtom) {
    return cachedAtom
  }
  const derivedAtom = atom(
    (get) => get(anAtom),
    (get, set, fn) =>
      set(
        anAtom,
        produce(get(anAtom), (draft) => fn(draft))
      )
  )
  derivedAtom.scope = anAtom.scope
  setWeakCacheItem(withImmerCache, deps, derivedAtom)
  return derivedAtom
}

export { atomWithImmer, useImmerAtom, withImmer }
