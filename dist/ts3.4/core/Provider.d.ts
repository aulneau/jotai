import React from 'react'
import { AnyAtom, Scope } from './types'
export declare const Provider: React.FC<{
  initialValues?: Iterable<readonly [AnyAtom, unknown]>
  scope?: Scope
}>
