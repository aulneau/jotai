export declare type SetStateAction<Value> = Value | ((prev: Value) => Value)
export declare type Getter = <Value>(atom: Atom<Value>) => Value
export declare type Read<Value> = (get: Getter) => Value | Promise<Value>
export declare type Setter = <Value, Update>(
  atom: WritableAtom<Value, Update>,
  update: Update
) => void
export declare type Write<Update> = (
  get: Getter,
  set: Setter,
  update: Update
) => void | Promise<void>
export declare type Scope = symbol | string | number
export declare type SetAtom<Update> = undefined extends Update
  ? (update?: Update) => void | Promise<void>
  : (update: Update) => void | Promise<void>
export declare type OnUnmount = () => void
export declare type OnMount<Update> = <S extends SetAtom<Update>>(
  setAtom: S
) => OnUnmount | void
export declare type Atom<Value> = {
  toString: () => string
  debugLabel?: string
  scope?: Scope
  read: Read<Value>
}
export declare type WritableAtom<Value, Update> = Atom<Value> & {
  write: Write<Update>
  onMount?: OnMount<Update>
}
export declare type WithInitialValue<Value> = {
  init: Value
}
export declare type PrimitiveAtom<Value> = WritableAtom<
  Value,
  SetStateAction<Value>
>
export declare type AnyAtom = Atom<unknown>
export declare type AnyWritableAtom = WritableAtom<unknown, unknown>
