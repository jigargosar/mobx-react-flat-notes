import { wrapActions } from './mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import * as R from 'ramda'
import validate from 'aproba'
import * as m from 'mobx'
import { isObservable } from 'mobx'
import { deleteAllDocs, getDocsFromAllDocs, notesDb } from './pouch'
import idx from 'idx.macro'
import debounce from 'lodash.debounce'
import { getCached, setCache } from './dom-helpers'

function createState() {
  const state = m.observable.object(
    {
      noteList: m.observable.array([]),
      selectedNoteId: null,
      pouchSettingsDialogOpen: false,
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
      const selectedById = state.getNoteById(state.selectedNoteId)
      return selectedById || state.firstNote
    },
    get selectedNoteContent() {
      return idx(state, _ => _.selectedNote.content)
    },
    isNoteSelected: note => R.eqProps('id', note, state.selectedNote),
    shouldFocusNote: note => state.isNoteSelected(note),
    getNoteById: id => state.noteList.find(R.propEq('id', id)),
  })
}

const state = createState()

/*  NOTE HELPERS  */

function createNewNote() {
  return {
    id: `N:${nanoid()}`,
    rev: null,
    title: faker.name.lastName(null),
    content: faker.lorem.lines(),
  }
}

function noteToPouch({ id, rev, title, content }) {
  return { _id: id, _rev: rev, title, content }
}

function noteFromPouchDoc({ _id, _rev, title, content }) {
  return { id: _id, rev: _rev, title, content }
}

/*  NOTE ACTIONS   */

function setNoteRev(rev, { id }) {
  const note = state.getNoteById(id)
  console.assert(isObservable(note))
  note.rev = rev
}

const noteActions = wrapActions({ setNoteRev })

/*  STATE ACTIONS HELPERS  */

function hydrateUIState() {
  const uiState = getCached('app-ui-state')
  if (uiState) {
    state.selectedNoteId = uiState.selectedNoteId
    state.pouchSettingsDialogOpen = uiState.pouchSettingsDialogOpen
  }
}

const pickUIState = R.pick(['selectedNoteId', 'pouchSettingsDialogOpen'])

function cacheUIState() {
  setCache('app-ui-state', pickUIState(state))
}

async function hydrateFromPouchDb() {
  const allDocsRes = await notesDb.allDocs({ include_docs: true })
  const notes = getDocsFromAllDocs(allDocsRes).map(noteFromPouchDoc)
  console.debug(`[pouch] hydrating notes`, notes)
  state.noteList.replace(notes)
}

function reset() {
  state.noteList.clear()
  state.selectedNoteId = null
  state.pouchSettingsDialogOpen = false
  return deleteAllDocs(notesDb)
}

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

async function setNoteContent(newContent, { id }) {
  const note = state.getNoteById(id)
  if (note) {
    note.content = newContent
    const { rev } = await notesDb.put(noteToPouch(note))
    noteActions.setNoteRev(rev, note)
  }
}

const setNoteContentDebounced = debounce(setNoteContent, 300, {
  leading: true,
  maxWait: 1000,
  trailing: true,
})

function setSelectedNoteContent(newContent) {
  setNoteContentDebounced(newContent, state.selectedNote)
}

/*  ACTIONS  */

const actions = wrapActions({
  async init() {
    hydrateUIState()
    await hydrateFromPouchDb()
    return m.autorun(cacheUIState, { name: 'cache-ui-state' })
  },
  addNewNote,
  reset,
  setSelectedNote,
  setSelectedNoteContent,
  openPouchSettingsDialog: () => (state.pouchSettingsDialogOpen = true),
  dismissPouchSettingsDialog: () =>
    (state.pouchSettingsDialogOpen = false),
})

actions.init().catch(console.error)

/*  HOOKS  */

export function useAppState() {
  return state
}

export function useAppActions() {
  return actions
}

export function useApp() {
  return [state, actions]
}
