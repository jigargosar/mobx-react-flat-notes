import { observer } from 'mobx-react-lite'
import { useAppStore } from '../state'
import React from 'react'
import { HeaderButton } from './Button'
import * as R from 'ramda'

function syncToIconName(sync) {
  const pushStateEq = R.pathEq(['push', 'state'])
  const conditions = [
    [R.anyPass([R.isNil, R.prop('canceled')]), 'sync_disabled'],
    [pushStateEq('stopped'), 'sync_problem'],
    [R.anyPass([pushStateEq('pending'), pushStateEq('active')]), 'sync'],
  ].map(([f, s]) => [f, R.always(s)])
  return R.cond(conditions)(sync)
}

const AppHeader = observer(({ openPouchSettingsDialog }) => {
  const [state, actions] = useAppStore()
  const syncIconName = syncToIconName(state.syncRef)

  return (
    <div className="flex justify-between">
      <div className="ml2 pv2 flex items-center us-none ttu b">FN</div>
      <div className="flex items-center">
        <i className="material-icons md-light_  md-18 md-24">
          {/*sync_disabled sync_problem sync*/}
          {syncIconName}
        </i>
        <HeaderButton onClick={openPouchSettingsDialog}>
          <div className="ml2">Sync Settings</div>
        </HeaderButton>
        <HeaderButton onClick={actions.addNewNote}>Add</HeaderButton>
        <HeaderButton onClick={actions.reset}>Reset</HeaderButton>
      </div>
    </div>
  )
})
AppHeader.displayName = 'AppHeader'

export default AppHeader
