import React, { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from './state'
import { useArrowKeys } from './hooks/useArrowKeys'
import { useFocusRef } from './hooks/useFocus'

function renderFlatBtn(label, onClick) {
  return (
    <button
      className="mh1 underline-hover pointer ttu bg-white bn blue"
      onClick={onClick}
    >
      {label}
    </button>
  )
}
const TopToolbar = observer(() => {
  const actions = useAppActions()

  return (
    <div className="flex">
      {renderFlatBtn('Add', actions.add)}
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
  const selectedClass = isSelected ? 'bg-light-blue' : ''
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
    <div ref={listRef} className="h-100">
      {state.displayNotes.map(note => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  )
})

NoteListSideBar.displayName = 'NoteListSideBar'

const NoteEditorPane = observer(() => {
  return (
    <div className="h-100 flex">
      <textarea className="flex-auto bn" defaultValue={'Lol Pop ppa'} />
    </div>
  )
})

NoteEditorPane.displayName = 'NoteEditorPane'

const App = observer(() => {
  return (
    <div className="h-100 flex flex-column bg-white">
      <div className="mt3 ttu tracked b">
        <div className="w-90 center">Flat Notes</div>
      </div>
      <div className="w-90 center">
        <div className="mt3 ">
          <TopToolbar />
        </div>
        <div className="mt3 flex-auto flex ">
          <div className="w-40 overflow-container ">
            <NoteListSideBar />
          </div>
          <div className="w-60">
            <NoteEditorPane />
          </div>
        </div>
      </div>
    </div>
  )
})
App.displayName = 'App'

export default App
