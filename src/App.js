import React, { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { PouchSettingsDialog } from './comp/PouchSettingsDialog'
import AppHeader from './comp/AppHeader'
import { NoteListSideBar } from './comp/NoteListSidebar'
import { NoteEditorPane } from './comp/NoteEditorPane'

const App = observer(() => {
  const pouchSettingDialogRef = useRef(null)
  return (
    <div className="h-100 flex flex-column">
      <div className="bg-vs-dark vs-dark shadow-1">
        <div className="center mw7">
          <AppHeader
            openPouchSettingsDialog={() => {
              const dialog = pouchSettingDialogRef.current
              if (dialog) {
                dialog.open()
              }
            }}
          />
        </div>
      </div>
      <div className="flex-auto flex flex-column ">
        <div className="flex-auto flex justify-center mw-100">
          <div
            className="pl1  dn db-ns flex-auto measure-narrow overflow-container "
            style={{ width: '15em' }}
          >
            <NoteListSideBar />
          </div>
          <div className="flex-auto measure-wide bn b--black-10 ">
            <NoteEditorPane />
          </div>
        </div>
      </div>
      <PouchSettingsDialog ref={pouchSettingDialogRef} />
    </div>
  )
})
App.displayName = 'App'

export default App
