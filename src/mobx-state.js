// @flow

import * as mobx from 'mobx'
import { autorun, extendObservable, toJS } from 'mobx'
import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import { getCached, setCache } from './dom-helpers'
import * as R from 'ramda'
import validate from 'aproba'
import t from 'flow-runtime'

import flowRuntimeMobx from 'flow-runtime-mobx'

flowRuntimeMobx(t, mobx)

// type Thing = {
//   numbers: number[],
//   map: Map<string,Object>,
// }
//
// const thing: Thing = observable({
//   numbers: [1, 2, 3],
//   map: observable.map({ foo: {'bar'} }),
// })
//
// console.log(toJS(thing))

type Note = {| id: string, title: string |}
type State = {| noteList: Array<Note>, selectedNoteId: ?string |}

function createState() {
  const observableState: State = {
    noteList: [],
    selectedNoteId: null,
  }
  const state = extendObservable({}, observableState, null, {
    name: 'AppState',
  })

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
    isNoteSelected(note: Note) {
      return note.id === state.selectedNoteId
    },
    shouldFocusNote(note: Note) {
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

function createNewNote(): Note {
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
