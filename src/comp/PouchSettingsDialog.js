import validate from 'aproba'
import { observer } from 'mobx-react-lite'
import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { FocusTrapZone } from 'office-ui-fabric-react'
import isHotKey from 'is-hotkey'
import * as R from 'ramda'
import { extendObservable, observable } from 'mobx'

function useHotKeyCallback(keyMap, deps = []) {
  return useCallback(e => {
    keyMap.forEach(([hotKeys, handler]) => {
      if (isHotKey(hotKeys, e)) {
        handler(e)
      }
    })
  }, deps)
}
function useOnEsc(handler) {
  validate('F', arguments)

  return useHotKeyCallback([['esc', handler]])
}

function pd(fn) {
  return R.tap(e => {
    if (!e.defaultPrevented) {
      e.preventDefault()
      fn(e)
    }
  })
}

function observableValue(initial = null, options = {}) {
  const obs = extendObservable(
    observable.box(initial),
    {
      get val() {
        return obs.get()
      },
      set val(newVal) {
        return obs.set(newVal)
      },
      map: fn => obs.set(fn(obs.get())),
      extend: obj => extendObservable(obs, obj),
    },
    null,
    options,
  )
  return obs
}

function useBoolObservable(initial = () => false) {
  return useState(() => {
    const obs = observableValue(initial()).extend({
      not: () => (obs.val = !obs.val),
      on: () => obs.set(true),
      off: () => obs.set(false),
    })
    return obs
  })[0]
}

const PouchSettingsDialog = observer(
  (_, ref) => {
    const backdropRef = useRef(null)

    const open = useBoolObservable()
    useImperativeHandle(ref, () => ({ open: open.on }), [])

    const onBackdropClick = useCallback(e => {
      const el = backdropRef.current
      if (e.target === el) {
        open.off()
      }
    }, [])

    const onKeyDownHandler = useOnEsc(pd(open.not))

    return (
      open.get() && (
        <FocusTrapZone>
          <div
            className="absolute absolute--fill flex items-center justify-center bg-black-50"
            ref={backdropRef}
            onClick={onBackdropClick}
            onKeyDown={onKeyDownHandler}
          >
            <div
              className="relative w-80 mw6 bg-white shadow-1"
              // style={{ top: '-15%' }}
            >
              <div className="pv4 ph3 f3 fw3 bg-blue white">
                Pouch Sync Settings
              </div>
              <div className="ph3 ">
                <p>Pouch Sync Settings Pouch</p>
                <p>Sync Settings Pouch</p>
                <p>Sync Settings Pouch Sync Settings</p>
              </div>
              <div className="ph3 pv2 bt b--light-gray flex flex-row-reverse">
                <button className="pv2 ph3 ma0 link pointer bn bg-blue white">
                  <div className="underline-hover">Save</div>
                </button>
                <button
                  className="pv2 ph3 ma0 link pointer bn black-70"
                  onClick={open.off}
                >
                  <div className="underline-hover">Cancel</div>
                </button>
              </div>
            </div>
          </div>
        </FocusTrapZone>
      )
    )
  },
  { forwardRef: true },
)
PouchSettingsDialog.displayName = 'PouchSettingsDialog'

export { PouchSettingsDialog }
