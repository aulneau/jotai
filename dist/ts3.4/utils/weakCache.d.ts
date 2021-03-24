export declare type WeakCache<T> = WeakMap<
  object,
  [WeakCache<T>] | [WeakCache<T>, T]
>
export declare const getWeakCacheItem: <T>(
  cache: WeakCache<T>,
  deps: readonly object[]
) => T | undefined
export declare const setWeakCacheItem: <T>(
  cache: WeakCache<T>,
  deps: readonly object[],
  item: T
) => void
