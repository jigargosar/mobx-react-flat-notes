import React, { useCallback, useLayoutEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from './state'
import { useArrowKeys } from './hooks/useArrowKeys'
import { useFocusRef } from './hooks/useFocus'
import MonacoEditor from 'react-monaco-editor'
import { useWindowSize } from './hooks/global-listeners'
import { DialogLargeHeaderExample } from './DialogExample'

const TopToolbar = observer(() => {
  const actions = useAppActions()

  return (
    <div className="flex items-center">
      <DialogLargeHeaderExample />
      {
        <button
          className="pointer ttu bg-inherit bn color-inherit"
          onClick={actions.addNewNote}
        >
          <div className="underline-hover">{'Add'}</div>
        </button>
      }
      {
        <button
          className="pointer ttu bg-inherit bn color-inherit"
          onClick={actions.reset}
        >
          <div className="underline-hover">{'Reset'}</div>
        </button>
      }
    </div>
  )
})
TopToolbar.displayName = 'TopToolbar'

const NoteItem = observer(({ note }) => {
  const state = useAppState()
  const actions = useAppActions()
  const isSelected = state.isNoteSelected(note)
  const shouldFocus = state.shouldFocusNote(note)
  const selectNote = () => actions.setSelectedNote(note)
  const selectedClass = isSelected ? 'bg-light-blue ' : ''
  const titleRef = useRef(null)

  useFocusRef(titleRef, shouldFocus)

  return (
    <div onClick={selectNote}>
      <div
        ref={titleRef}
        className={`pv1 ph2 ${selectedClass}`}
        tabIndex={isSelected ? 0 : -1}
        data-is-focusable={true}
        onFocus={selectNote}
      >
        {note.title}
      </div>
    </div>
  )
})
NoteItem.displayName = 'NoteItem'

const NoteListSideBar = observer(() => {
  const state = useAppState()
  const listRef = useRef(null)
  useArrowKeys(listRef)
  return (
    <div ref={listRef} className="h-100 pv2">
      {state.displayNotes.map(note => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  )
})

NoteListSideBar.displayName = 'NoteListSideBar'

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

const AppBar = observer(() => {
  const actions = useAppActions()

  return (
    <div className="flex justify-between">
      <div className="ml2 pv2 flex items-center us-none ttu b">FN</div>
      <div className="flex items-center">
        <button
          className="pv2 ttu f7 dim   link pointer bn bg-inherit color-inherit"
          onClick={actions.openSyncSettingsDialog}
        >
          <div className="underline-hover">Sync Settings</div>
        </button>
        <button
          className="pv2 ttu f7 dim   link pointer bn bg-inherit color-inherit"
          onClick={actions.addNewNote}
        >
          <div className="underline-hover">{'Add'}</div>
        </button>
        <button
          className="pv2 ttu f7 dim   link pointer bn bg-inherit color-inherit"
          onClick={actions.reset}
        >
          <div className="underline-hover">{'Reset'}</div>
        </button>
      </div>
    </div>
  )
})
AppBar.displayName = 'AppBar'

const SyncSettingsDialog = observer(() => {
  return (
    <div className="absolute absolute--fill flex items-center justify-center bg-black-50">
      <div className="relative w-80 mw6 bg-white " style={{ top: '-15%' }}>
        <div className="pa4 f3 tc bg-blue white">Pouch Sync Settings</div>
        <div className="ph3 ">
          <p>Pouch Sync Settings Pouch</p>
          <p>Sync Settings Pouch</p>
          <p>Sync Settings Pouch Sync Settings</p>
        </div>
      </div>
    </div>
  )
})
SyncSettingsDialog.displayName = 'SyncSettingsDialog'

const App = observer(() => {
  return (
    <div className="h-100 flex flex-column">
      <div className="bg-black-90 white shadow-1">
        <div className="center mw7">
          <AppBar />
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
      <SyncSettingsDialog />
    </div>
  )
})
App.displayName = 'App'

export default App
