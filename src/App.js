import React from 'react'
import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from './state'

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
    <div className="mv3 flex">
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
  const selectNote = () => actions.setSelectedNote(note)

  return (
    <div onClick={selectNote}>
      <div
        className={`pv1 ph2 ${
          isSelected
            ? 'hover-bg-light-blue bg-lightest-blue'
            : 'hover-bg-lightest-blue'
        }`}
        tabIndex={0}
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
  return (
    <div className="w-90 center">
      <div className="mv3 ttu tracked b">Flat Notes</div>
      <TopToolbar />
      <div className="mv3">
        {state.displayNotes.map(note => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  )
})
App.displayName = 'App'

export default App
