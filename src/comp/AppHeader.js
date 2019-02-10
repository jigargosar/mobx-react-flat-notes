import { observer } from 'mobx-react-lite'
import { useAppActions } from '../state'
import React from 'react'

const AppHeader = observer(({ openPouchSettingsDialog }) => {
  const actions = useAppActions()

  return (
    <div className="flex justify-between">
      <div className="ml2 pv2 flex items-center us-none ttu b">FN</div>
      <div className="flex items-center">
        <button
          className="pv2 ttu f7 grow underline-hover  pointer bn bg-inherit color-inherit"
          onClick={openPouchSettingsDialog}
        >
          Sync Settings
        </button>
        <button
          className="pv2 ttu f7 grow underline-hover  pointer bn bg-inherit color-inherit"
          onClick={actions.addNewNote}
        >
          Add
        </button>
        <button
          className="pv2 ttu f7 grow underline-hover  pointer bn bg-inherit color-inherit"
          onClick={actions.reset}
        >
          Reset
        </button>
      </div>
    </div>
  )
})
AppHeader.displayName = 'AppHeader'

export default AppHeader
