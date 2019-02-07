import { extendObservable, observable } from 'mobx'
import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'

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

const appActions = wrapActions({
  add: () => {
    appState._noteList.unshift({
      id: `N:${nanoid()}`,
      title: faker.name.lastName(null),
    })
  },
})

export function useAppState() {
  return appState
}

export function useAppActions() {
  return appActions
}
