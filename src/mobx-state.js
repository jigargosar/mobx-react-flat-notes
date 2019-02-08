// @flow
// @flow-runtime warn

import * as mobx from 'mobx'
import { autorun, extendObservable, toJS } from 'mobx'
import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import { getCached, setCache } from './dom-helpers'
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

type Note = { id: string, title: string }
type StateData = { noteList: Array<Note>, selectedNoteId: ?string }

type StateComputed = {
  displayNotes: Note[],
  firstNote: ?Note,
  selectedNote: ?Note,
}

type StateView = {
  isNoteSelected: Note => boolean,
  shouldFocusNote: Note => boolean,
}

type AppState = StateData & StateComputed & StateView

function createState(): AppState {
  const observableState: StateData = {
    noteList: [],
    selectedNoteId: null,
  }
  const state: StateData = extendObservable({}, observableState, null, {
    name: 'AppState',
  })

  const appState: AppState = extendObservable(state, {
    get displayNotes(): Note[] {
      return state.noteList
    },
    get firstNote(): ?Note {
      return state.noteList[0]
    },
    get selectedNote(): ?Note {
      const selectedById = state.noteList.find(
        n => n.id === state.selectedNoteId,
      )
      return selectedById || this.firstNote
    },
    isNoteSelected(note: Note): boolean {
      return note === appState.selectedNote
    },
    shouldFocusNote(note: Note): boolean {
      return appState.isNoteSelected(note)
    },
  })
  return appState
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
