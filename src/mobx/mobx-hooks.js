import { useState } from 'react'
import { boolObservable, stringObservable } from './mobx-helpers'

export function useBoolObservable(initial = () => false) {
  return useState(() => boolObservable(initial()))[0]
}

export function useStringObservable(initial = () => false) {
  return useState(() => stringObservable(initial()))[0]
}
