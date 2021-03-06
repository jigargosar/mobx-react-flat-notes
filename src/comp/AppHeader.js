import { observer } from 'mobx-react-lite'
import { useAppStore } from '../store'
import React from 'react'
import { HeaderButton, HeaderIconButton } from './Button'
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

function getSyncIconProps(state) {
  const syncIconName = syncToIconName(state.syncRef)
  const syncDisabled = state.isSyncDisabled
  const isSyncError = !R.isNil(state.syncErrorMsg) && !syncDisabled
  return {
    iconName: isSyncError ? 'sync_problem' : syncIconName,
    errorMsg: state.syncErrorMsg,
    syncDisabled,
  }
}

const AppHeader = observer(({ openPouchSettingsDialog }) => {
  const [state, actions] = useAppStore()
  const syncIconProps = getSyncIconProps(state)

  return (
    <div className="flex justify-between">
      <div className="ml2 pv2 flex items-center us-none ttu b">FN</div>
      <div className="flex items-center">
        <HeaderIconButton onClick={openPouchSettingsDialog}>
          {/*<div className="ml2">Sync Settings</div>*/}
          <i
            className={`material-icons md-light  md-18 md-24 ${
              syncIconProps.syncDisabled ? 'md-inactive' : ''
            }`}
            title={syncIconProps.errorMsg}
          >
            {syncIconProps.iconName}
          </i>
        </HeaderIconButton>
        <HeaderButton onClick={actions.addNewNote}>Add</HeaderButton>
        <HeaderButton onClick={actions.reset}>Reset</HeaderButton>
      </div>
    </div>
  )
})
AppHeader.displayName = 'AppHeader'

export default AppHeader
