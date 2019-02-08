// @flow

import * as mobx from 'mobx'
import {
  autorun,
  extendObservable,
  observable,
  ObservableMap,
  toJS,
} from 'mobx'
import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import { getCached, setCache } from './dom-helpers'
import * as R from 'ramda'
import validate from 'aproba'
import t from 'flow-runtime'

import flowRuntimeMobx from 'flow-runtime-mobx'

flowRuntimeMobx(t, mobx)

type Thing = {
  numbers: number[],
  map: Map<string, string>,
}

const thing: Thing = observable({
  numbers: [1, 2, 3],
  map: new ObservableMap({ foo: 'bar' }),
})

console.log(toJS(thing))

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
    get firstNote() {
      return R.pathOr(null)(['noteList', 0])(state)
    },
    get selectedNote() {
      const selectedById = state.noteList.find(
        R.propEq('id', state.selectedNoteId),
      )
      return selectedById || state.firstNote
    },
    isNoteSelected(note) {
      return R.eqProps('id', note, state.selectedNote)
    },
    shouldFocusNote(note) {
      return state.isNoteSelected(note)
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

function setSelectedNote(note) {
  validate('O', arguments)
  state.selectedNoteId = note.id
}

/*  ACTIONS  */

const actions = wrapActions({
  init() {
    hydrate()
    return startAutoPersist()
  },
  add() {
    const note = createNewNote()
    insertNoteAt(0, note)
    setSelectedNote(note)
  },
  reset,
  setSelectedNote,
})

actions.init()

/*  HOOKS  */

export function useAppState() {
  return state
}

export function useAppActions() {
  return actions
}
