import React, { Fragment } from 'react'
import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from './state'

function toolbarButton(label, onClick) {
  return (
    <button
      className="ml3 underline-hover pointer ttu bg-white bn blue pv1 ph2"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

const TopToolbar = observer(() => {
  const actions = useAppActions()

  return <div className="mv3 nl3">{toolbarButton('Add', actions.add)}</div>
})

TopToolbar.displayName = 'TopToolbar'

const App = observer(() => {
  const state = useAppState()
  return (
    <div className="w-90 center">
      <div className="mv3 ttu tracked b">Flat Notes</div>
      <TopToolbar />
      <div className="mv3">
        {state.displayNotes.map(note => (
          <Fragment key={note.id}>
            <div className="pv1">{note.title}</div>
          </Fragment>
        ))}
      </div>
    </div>
  )
})

App.displayName = 'App'

export default App
