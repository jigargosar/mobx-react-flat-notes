import React, { useCallback, useLayoutEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from './state'
import MonacoEditor from 'react-monaco-editor'
import { useWindowSize } from './hooks/global-listeners'
import { PouchSettingsDialog } from './comp/PouchSettingsDialog'
import AppHeader from './comp/AppHeader'
import { NoteListSideBar } from './comp/NoteListSidebar'

function useMonacoEditor() {
  const editorRef = useRef(null)
  const windowSize = useWindowSize()

  useLayoutEffect(() => {
    const editor = editorRef.current
    if (editor) {
      editor.layout()
    }
  }, [windowSize, editorRef.current])

  const editorDidMount = useCallback(editor => {
    editorRef.current = editor
  }, [])

  return [editorDidMount, editorRef]
}
const NoteEditorPane = observer(() => {
  const [editorDidMount] = useMonacoEditor()
  const state = useAppState()
  const actions = useAppActions()

  return (
    <div
      className="overflow-hidden h-100 mw-100 bg-light-pink "
      style={{ width: '34em' }}
    >
      <MonacoEditor
        editorDidMount={editorDidMount}
        value={state.selectedNoteContent || ''}
        onChange={value => actions.setSelectedNoteContent(value)}
      />
    </div>
  )
})
NoteEditorPane.displayName = 'NoteEditorPane'

const App = observer(() => {
  const pouchSettingDialogRef = useRef(null)
  return (
    <div className="h-100 flex flex-column">
      <div className="bg-black-90 white shadow-1">
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
          <div className="flex-auto measure-wide ba b--black-10 ">
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
