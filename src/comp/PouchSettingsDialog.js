import { observer } from 'mobx-react-lite'
import React, { useCallback, useImperativeHandle, useRef } from 'react'
import { FocusTrapZone } from 'office-ui-fabric-react'
import { useBoolObservable } from '../mobx/mobx-hooks'
import { pd, useOnEsc } from '../hooks/keyboard'

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
      !open.get() && (
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
                <label className="flex flex-column mv3">
                  <div className="ml1 black-70 f6">URL</div>
                  <input
                    className="flex-auto pa2 "
                    defaultValue={'http://a@b:localhost:2323'}
                  />
                </label>
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
