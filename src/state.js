import { autorun, extendObservable, observable, toJS } from 'mobx'
import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import { getCached, setCache } from './dom-helpers'

function createState() {
  const state = observable.object({ noteList: [] }, null, {
    name: 'App State',
  })

  return extendObservable(state, {
    get displayNotes() {
      return state.noteList
    },
  })
}

const appState = createState()

function hydrate() {
  const cached = getCached('app-state')
  if (cached) {
    appState.noteList = cached.noteList
  }
}
function startAutoPersist() {
  return autorun(() => setCache('app-state', toJS(appState)))
}

const appActions = wrapActions({
  init() {
    hydrate()
    return startAutoPersist()
  },
  add() {
    appState.noteList.unshift({
      id: `N:${nanoid()}`,
      title: faker.name.lastName(null),
    })
  },
})

appActions.init()

export function useAppState() {
  return appState
}

export function useAppActions() {
  return appActions
}
