import { useCallback } from 'react'
import isHotKey from 'is-hotkey'
import validate from 'aproba'
import * as R from 'ramda'

function useHotKeyCallback(keyMap, deps = []) {
  return useCallback(e => {
    keyMap.forEach(([hotKeys, handler]) => {
      if (isHotKey(hotKeys, e)) {
        handler(e)
      }
    })
  }, deps)
}

export function useOnEsc(handler) {
  validate('F', arguments)

  return useHotKeyCallback([['esc', handler]])
}

export function pd(fn) {
  return R.tap(e => {
    if (!e.defaultPrevented) {
      e.preventDefault()
      fn(e)
    }
  })
}
