import {
  EventObject,
  StateMachine,
  InterpreterOptions,
  MachineOptions,
  Typestate,
  State,
} from 'xstate'
import { Getter } from '../core/types'
export declare function atomWithMachine<
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = {
    value: any
    context: TContext
  }
>(
  getMachine:
    | StateMachine<TContext, any, TEvent, TTypestate>
    | ((get: Getter) => StateMachine<TContext, any, TEvent, TTypestate>),
  options?: Partial<InterpreterOptions> &
    Partial<MachineOptions<TContext, TEvent>>
): import('jotai').WritableAtom<
  State<TContext, TEvent, any, TTypestate>,
  | import('xstate').SCXML.Event<TEvent>
  | import('xstate').SingleOrArray<import('xstate').Event<TEvent>>
>
