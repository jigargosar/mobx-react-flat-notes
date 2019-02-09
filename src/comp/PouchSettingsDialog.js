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

function useHotKeyCallback(keyMap, deps = []) {
  return useCallback(e => {
    keyMap.forEach(([hotKeys, handler]) => {
      if (isHotKey(hotKeys, e)) {
        handler(e)
      }
    })
  }, deps)
}

function pd(fn) {
  return R.tap(e => {
    if (!e.defaultPrevented) {
      e.preventDefault()
      fn(e)
    }
  })
}

function useBool(initial = () => false) {
  const [state, setVal] = useState(initial)
  const not = useCallback(() => setVal(R.not), [])
  const on = useCallback(() => setVal(true), [])
  const off = useCallback(() => setVal(false), [])

  const actions = useRef(() => ({
    on,
    off,
    not,
  }))

  return [state, actions]
}

const PouchSettingsDialog = observer(
  (_, ref) => {
    const backdropRef = useRef(null)

    const [isOpen, openB] = useBool()
    useImperativeHandle(ref, () => ({ open: openB.on }), [])

    const onBackdropClick = useCallback(e => {
      if (e.target === backdropRef.current) {
        openB.off()
      }
    }, [])

    const onKeyDownHandler = useHotKeyCallback([['esc', pd(openB.not)]])

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
                  onClick={openB.off}
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
