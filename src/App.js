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

const App = observer(() => {
  const state = useAppState()
  const listRef = useRef(null)
  useArrowKeys(listRef)
  return (
    <div className="w-90 center h-100 flex flex-column">
      <div className="mt3 ttu tracked b">Flat Notes</div>
      <div className="mt3 ">
        <TopToolbar />
      </div>
      <div className="mt3 flex flex-auto">
        <div
          ref={listRef}
          className="w-40 pv3 ba b--black-20 overflow-container"
        >
          {state.displayNotes.map(note => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
        <div className="w-60 ba b--black-20">Editor</div>
      </div>
    </div>
  )
})
App.displayName = 'App'

export default App
