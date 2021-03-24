import * as O from 'optics-ts'
import { WritableAtom, SetStateAction, PrimitiveAtom } from '../core/types'
export declare function focusAtom<S, A>(
  atom: PrimitiveAtom<S>,
  callback: (optic: O.OpticFor<S>) => O.Prism<S, any, A>
): WritableAtom<A | undefined, SetStateAction<A>>
export declare function focusAtom<S, A>(
  atom: PrimitiveAtom<S>,
  callback: (optic: O.OpticFor<S>) => O.Traversal<S, any, A>
): WritableAtom<Array<A>, SetStateAction<A>>
export declare function focusAtom<S, A>(
  atom: PrimitiveAtom<S>,
  callback: (
    optic: O.OpticFor<S>
  ) => O.Lens<S, any, A> | O.Equivalence<S, any, A> | O.Iso<S, any, A>
): WritableAtom<A, SetStateAction<A>>
