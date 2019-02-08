import React, { createRef, useLayoutEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from './state'
import { useArrowKeys } from './hooks/useArrowKeys'
import { useFocusRef } from './hooks/useFocus'
import MonacoEditor from 'react-monaco-editor'
import { useWindowListener } from './hooks/useDocumentListener'

function renderFlatBtn(label, onClick) {
  return (
    <button
      className="pointer ttu bg-inherit bn color-inherit"
      onClick={onClick}
    >
      <div className="underline-hover">{label}</div>
    </button>
  )
}
const TopToolbar = observer(() => {
  const actions = useAppActions()

  return (
    <div className="flex items-center">
      {renderFlatBtn('Add', actions.addNewNote)}
      {renderFlatBtn('Reset', actions.reset)}
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

function useWindowSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  useWindowListener('resize', () => {
    setSize({ width: window.innerWidth, height: window.innerHeight })
  })
  return size
}

const NoteEditorPane = observer(() => {
  const cRef = createRef()
  const meRef = createRef()

  const windowSize = useWindowSize()
  // const [size, setSize] = useState(() => ({ width: 0, height: 0 }))
  //
  // useLayoutEffect(() => {
  //   const editor = meRef.current
  //   const containerEl = cRef.current
  //   if (editor && containerEl) {
  //     const newSize = R.pick(['width', 'height'])(
  //       containerEl.getBoundingClientRect(),
  //     )
  //     setSize(newSize)
  //     editor.layout()
  //   }
  // }, [windowSize, meRef.current, cRef.current])

  useLayoutEffect(() => {
    debugger
    if (meRef.current) {
      meRef.current.layout()
    }
  }, [windowSize, meRef.current])

  return (
    <div
      ref={cRef}
      className="overflow-hidden h-100 bg-light-pink mw-100"
      style={{ width: '34em' }}
    >
      <MonacoEditor
        editorDidMount={editor => {
          debugger
          meRef.current = editor
        }}
        // width={size.width}
        // height={size.height}
      />
    </div>
  )
})

NoteEditorPane.displayName = 'NoteEditorPane'

const App = observer(() => {
  return (
    <div className="h-100 flex flex-column">
      <div className="bg-black-80 white shadow-1">
        <div className="center max-app-width flex ">
          <div className="flex-auto ttu tracked b pa2">Flat Notes</div>
          <TopToolbar />
        </div>
      </div>
      <div className="flex-auto flex flex-column ">
        <div className="flex-auto flex justify-center mw-100">
          <div className="pl1  dn db-ns flex-auto measure-narrow overflow-container ">
            <NoteListSideBar />
          </div>
          <div className="flex-auto measure-wide ba b--black-10 ">
            <NoteEditorPane />
          </div>
        </div>
      </div>
    </div>
  )
})
App.displayName = 'App'

export default App
