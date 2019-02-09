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

function useBoolObservable(initial = () => false) {
  return useState(() => {
    const state = observable.object({ val: initial() })
    return extendObservable(state, {
      get() {
        return state.val
      },
      set(newVal) {
        state.val = newVal
      },
      not() {
        state.val = !state.val
      },
      on() {
        state.set(true)
      },
      off() {
        state.set(false)
      },
    })
  })[0]
}

const PouchSettingsDialog = observer(
  (_, ref) => {
    const backdropRef = useRef(null)

    const opn = useBoolObservable()
    const [isOpen, openA] = [opn.get(), opn]

    useImperativeHandle(ref, () => ({ open: openA.on }), [])

    const onBackdropClick = useCallback(e => {
      const el = backdropRef.current
      if (e.target === el) {
        openA.off()
      }
    }, [])

    const onKeyDownHandler = useOnEsc(pd(openA.not))

    return (
      isOpen && (
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
                  onClick={openA.off}
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
