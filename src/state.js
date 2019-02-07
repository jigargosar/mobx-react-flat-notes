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

const state = createState()

function hydrate() {
  const cached = getCached('app-state')
  if (cached) {
    state.noteList = cached.noteList
  }
}
function startAutoPersist() {
  return autorun(() => setCache('app-state', toJS(state)))
}

const actions = wrapActions({
  init() {
    hydrate()
    return startAutoPersist()
  },
  add() {
    state.noteList.unshift({
      id: `N:${nanoid()}`,
      title: faker.name.lastName(null),
    })
  },
})

actions.init()

export function useAppState() {
  return state
}

export function useAppActions() {
  return actions
}
