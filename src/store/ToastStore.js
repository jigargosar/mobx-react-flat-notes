import * as m from 'mobx'
import { wrapActions } from '../mobx/mobx-helpers'
import * as mu from 'mobx-utils'

export function ToastStore() {
  const ts = m.observable.object(
    {
      msg: null,
      st: null,
      get toast() {
        return ts.msg
      },
      ...wrapActions({
        addMsg(msg) {
          ts.msg = msg
          ts.st = Date.now()
        },
      }),
    },
    null,
    { name: 'ToastStore' },
  )

  m.autorun(() => {
    if (ts.msg && mu.now() - ts.st > 5000) {
      ts.msg = null
      ts.st = null
    }
  })

  console.debug(`'created ToastStore'`, 'created ToastStore')
  return ts
}
