import { observer } from 'mobx-react-lite'
import { useAppActions } from '../state'
import React from 'react'
import { HeaderButton } from './Button'

const AppHeader = observer(({ openPouchSettingsDialog }) => {
  const actions = useAppActions()

  return (
    <div className="flex justify-between">
      <div className="ml2 pv2 flex items-center us-none ttu b">FN</div>
      <div className="flex items-center">
        <HeaderButton onClick={openPouchSettingsDialog}>
          Sync Settings
        </HeaderButton>
        <HeaderButton onClick={actions.addNewNote}>Add</HeaderButton>
        <HeaderButton onClick={actions.reset}>Reset</HeaderButton>
      </div>
    </div>
  )
})
AppHeader.displayName = 'AppHeader'

export default AppHeader
