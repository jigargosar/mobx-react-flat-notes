import { autorun, extendObservable, observable, toJS } from 'mobx'
import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import { getCached, setCache } from './dom-helpers'
import * as R from 'ramda'

function createState() {
  const state = observable.object(
    {
      noteList: [],
      selectedNoteId: null,
    },
    null,
    {
      name: 'App State',
    },
  )

  return extendObservable(state, {
    get displayNotes() {
      return state.noteList
    },
    get selectedNote() {
      return R.path(['noteList', state.selectedNoteId])(state)
    },
  })
}

const state = createState()

/*  ACTIONS HELPERS  */

function hydrate() {
  const cached = getCached('app-state')
  if (cached) {
    state.noteList = cached.noteList
    state.selectedNoteId = cached.selectedNoteId
  }
}

function reset() {
  state.noteList = []
  state.selectedNoteId = null
}

function startAutoPersist() {
  return autorun(() => setCache('app-state', toJS(state)))
}

function createNewNote() {
  return {
    id: `N:${nanoid()}`,
    title: faker.name.lastName(null),
  }
}

function insertNoteAt(idx, note) {
  state.noteList.splice(idx, 0, note)
}

/*  ACTIONS  */

const actions = wrapActions({
  init() {
    hydrate()
    return startAutoPersist()
  },
  add() {
    insertNoteAt(0, createNewNote())
  },
  reset,
})

actions.init()

/*  HOOKS  */

export function useAppState() {
  return state
}

export function useAppActions() {
  return actions
}
