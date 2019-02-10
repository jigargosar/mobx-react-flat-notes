import { observer, useDisposable, useObserver } from 'mobx-react-lite'
import React, { useCallback, useImperativeHandle, useRef } from 'react'
import { FocusTrapZone } from 'office-ui-fabric-react'
import { useBoolObservable, useStringObservable } from '../mobx/mobx-hooks'
import { pd, useOnEsc } from '../hooks/keyboard'
import { FlatButton, PrimaryButton } from './Button'
import { useAppStore } from '../state'
import * as m from 'mobx'

const PouchSettingsDialog = observer(
  (_, ref) => {
    const [state, actions] = useAppStore()

    const pouchUrl = useStringObservable(() => state.pouchRemoteUrl)
    const onSubmitHandler = () => actions.setPouchUrl(pouchUrl.get())
    const onCancelHandler = () => {
      open.off()
      pouchUrl.set(state.pouchRemoteUrl)
    }

    const backdropRef = useRef(null)

    const open = useBoolObservable()
    useImperativeHandle(ref, () => ({ open: open.on }), [])

    const onBackdropClick = useCallback(e => {
      const el = backdropRef.current
      if (e.target === el) {
        open.off()
      }
    }, [])

    useDisposable(
      () =>
        m.autorun(() => {
          if (!open.get()) {
            pouchUrl.set(state.pouchRemoteUrl)
          }
        }),
      [open.val],
    )

    const onKeyDownHandler = useOnEsc(pd(open.not))

    return useObserver(
      () =>
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
                <form onSubmit={pd(onSubmitHandler)}>
                  <div className="pv4 ph3 f3 fw3 bg-blue white">
                    Pouch Sync Settings
                  </div>
                  <div className="ph3 ">
                    <label className="mv3 db">
                      <div className="ml1 black-70 f6 lh-copy">
                        Remote URL
                      </div>
                      <div className="flex flex-column  ba b--moon-gray ">
                        <input
                          autoFocus
                          className="bn flex-auto pa2"
                          placeholder="e.g: http://a@b:localhost:2323"
                          {...pouchUrl.bindInput}
                        />
                      </div>
                    </label>
                  </div>
                  <div className="pa3 bn b--light-gray flex flex-row-reverse">
                    <PrimaryButton type="submit" label="Sync" />
                    <FlatButton onClick={onCancelHandler} label="Cancel" />
                  </div>
                </form>
              </div>
            </div>
          </FocusTrapZone>
        ),
    )
  },
  { forwardRef: true },
)
PouchSettingsDialog.displayName = 'PouchSettingsDialog'

export { PouchSettingsDialog }
