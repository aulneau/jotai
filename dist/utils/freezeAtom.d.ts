import { atom, Atom } from 'jotai'
export declare function freezeAtom<T extends Atom<any>>(anAtom: T): T
export declare const atomFrozenInDev: typeof atom
