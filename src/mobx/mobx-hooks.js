import { useState } from 'react'
import { boolObservable } from './mobx-helpers'

export function useBoolObservable(initial = () => false) {
  return useState(() => boolObservable(initial()))[0]
}
