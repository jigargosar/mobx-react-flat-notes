import React from 'react'
import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from './state'

function renderFlatBtn(label, onClick) {
  return (
    <button
      className="ml3 underline-hover pointer ttu bg-white bn blue"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

const TopToolbar = observer(() => {
  const actions = useAppActions()

  return <div className="mv3 nl3">{renderFlatBtn('Add', actions.add)}</div>
})

TopToolbar.displayName = 'TopToolbar'

const NoteItem = observer(({ note }) => {
  return (
    <div className="">
      <div className="pv1">{note.title}</div>
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
