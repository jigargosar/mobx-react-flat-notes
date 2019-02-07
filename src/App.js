import React, { Fragment } from 'react'
import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from './state'

const App = observer(() => {
  const state = useAppState()
  const actions = useAppActions()
  return (
    <div className="w-90 center">
      <div className="mv3 ttu tracked b">Flat Notes</div>
      <div className="mv3 nl3">
        <button
          className="ml3 underline-hover pointer ttu bg-white bn blue pv1 ph2"
          onClick={actions.add}
        >
          Add
        </button>
      </div>
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
