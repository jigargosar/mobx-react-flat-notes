import React from 'react'
import { observer } from 'mobx-react-lite'

const App = observer(() => {
  return <div className="mv3 w-90 center">Flat Notes</div>
})

App.displayName = 'App'

export default App
