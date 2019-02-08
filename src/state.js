import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import { getCached, setCache } from './dom-helpers'
import * as R from 'ramda'
import validate from 'aproba'
import * as m from 'mobx'

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

/*  ACTIONS HELPERS  */

const getPersistedAppState = () => getCached('app-state')

const persistAppState = () => setCache('app-state', m.toJS(state))

function hydrate() {
  const cached = getPersistedAppState()
  if (cached) {
    state.noteList.replace(cached.noteList)
    state.selectedNoteId = cached.selectedNoteId
  }
}

function reset() {
  state.noteList.clear()
  state.selectedNoteId = null
}

function startAutoPersist() {
  return m.autorun(persistAppState)
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
