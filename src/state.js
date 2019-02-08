import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import { setCache } from './dom-helpers'
import * as R from 'ramda'
import validate from 'aproba'
import * as m from 'mobx'
import { deleteAllDocs, getDocsFromAllDocs, notesDb } from './pouch'

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

function noteFromPouchDoc({ _id, _rev, title }) {
  return { id: _id, rev: _rev, title }
}

/*  NOTE ACTIONS   */

function setNoteRev(rev, note) {
  note.rev = rev
}

const noteActions = wrapActions({ setNoteRev })

/*  STATE ACTIONS HELPERS  */

// const getPersistedAppState = () => getCached('app-state')

const persistAppState = () => setCache('app-state', m.toJS(state))

// function hydrateFromLocalStorage() {
//   const cached = getPersistedAppState()
//   if (cached) {
//     state.noteList.replace(cached.noteList)
//     state.selectedNoteId = cached.selectedNoteId
//   }
// }

async function hydrateFromPouchDb() {
  const allDocsRes = await notesDb.allDocs({ include_docs: true })
  const notes = getDocsFromAllDocs(allDocsRes).map(noteFromPouchDoc)
  console.debug(`[pouch] hydrating notes`, notes)
  state.noteList.replace(notes)
}

function reset() {
  state.noteList.clear()
  state.selectedNoteId = null
  return deleteAllDocs(notesDb)
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

async function addNewNote() {
  const note = createNewNote()
  insertNoteAt(0, note)
  setSelectedNote(note)
  const { rev } = await notesDb.put(noteToPouch(note))
  noteActions.setNoteRev(rev, note)
}

/*  ACTIONS  */

const actions = wrapActions({
  async init() {
    // hydrateFromLocalStorage()
    await hydrateFromPouchDb()
    return startAutoCache()
  },
  addNewNote,
  reset,
  setSelectedNote,
})

actions.init().catch(console.error)

/*  HOOKS  */

export function useAppState() {
  return state
}

export function useAppActions() {
  return actions
}
