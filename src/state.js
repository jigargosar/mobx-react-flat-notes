import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import { getCached, setCache } from './dom-helpers'
import * as R from 'ramda'
import validate from 'aproba'
import * as m from 'mobx'
import { notesDb } from './pouch'

function createState() {
  const state = m.observable.object(
    {
      noteList: m.observable.array([]),
      selectedNoteId: null,
    },
    null,
    {
      name: 'App State',
    },
  )

  return m.extendObservable(state, {
    get displayNotes() {
      return state.noteList
    },
    get firstNote() {
      return m.get(state.noteList, 0)
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

/*  NOTE HELPERS  */

function createNewNote() {
  return {
    id: `N:${nanoid()}`,
    rev: null,
    title: faker.name.lastName(null),
  }
}

function noteToPouch({ id, rev, title }) {
  return { _id: id, _rev: rev, title: title }
}

/*  STATE ACTIONS HELPERS  */

const getPersistedAppState = () => getCached('app-state')

const persistAppState = () => setCache('app-state', m.toJS(state))

function hydrateFromLocalStorage() {
  const cached = getPersistedAppState()
  if (cached) {
    state.noteList.replace(cached.noteList)
    state.selectedNoteId = cached.selectedNoteId
  }
}

// function hydrateFromPouchDb() {}

function reset() {
  state.noteList.clear()
  state.selectedNoteId = null
}

const startAutoCache = () => m.autorun(persistAppState)

function insertNoteAt(idx, note) {
  validate('NO', arguments)
  state.noteList.splice(idx, 0, note)
}

function setSelectedNote(note) {
  validate('O', arguments)
  state.selectedNoteId = note.id
}

function addNewNote() {
  const note = createNewNote()
  insertNoteAt(0, note)
  setSelectedNote(note)
  notesDb.put(noteToPouch(note))
}

/*  ACTIONS  */

const actions = wrapActions({
  init() {
    hydrateFromLocalStorage()
    return startAutoCache()
  },
  addNewNote,
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
