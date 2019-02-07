import { extendObservable, observable } from 'mobx'

function createState() {
  const state = observable.object({ _noteList: [] }, null, {
    name: 'Root State',
  })

  return extendObservable(state, {
    get displayNotes() {
      return state._noteList
    },
  })
}

const appState = createState()

export function useAppState() {
  return appState
}
