export declare const createPending: <T>() => {
  fulfilled: boolean
  promise: Promise<T>
  resolve: (data: T) => void
}
