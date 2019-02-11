import { wrapActions } from './mobx/mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import * as R from 'ramda'
import validate from 'aproba'
import * as m from 'mobx'
import { allDocsResultToDocs, deleteAllDocs, notesDb } from './pouch'
import idx from 'idx.macro'
import debounce from 'lodash.debounce'
import { getCached, setCache } from './dom-helpers'

import isUrl from 'is-url-superb'
import _ from 'highland'
import PouchDb from 'pouchdb-browser'

window.isUrl = isUrl

function createState() {
  const state = m.observable.object(
    {
      noteList: m.observable.array([]),
      selectedNoteId: null,
      pouchRemoteUrl: '',
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
    },
    null,
    {
      name: 'App State',
    },
  )

  return state
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
  console.assert(m.isObservable(note))
  note.rev = rev
}

const noteActions = wrapActions({ setNoteRev })

/*  STATE ACTIONS HELPERS  */

function hydrateUIState() {
  const uiState = getCached('app-ui-state')
  if (uiState) {
    state.selectedNoteId = uiState.selectedNoteId
  }
  const settings = getCached('app-user-settings')
  if (settings) {
    state.pouchRemoteUrl = settings.pouchRemoteUrl
  }
}

const pickUIState = R.pick(['selectedNoteId'])

function cacheUIState() {
  setCache('app-ui-state', pickUIState(state))
}

const pickUserSettings = R.pick(['pouchRemoteUrl'])

function cacheUserSettings() {
  setCache('app-user-settings', pickUserSettings(state))
}

async function hydrateFromPouchDb() {
  const allDocsRes = await notesDb.allDocs({ include_docs: true })
  const notes = allDocsResultToDocs(allDocsRes).map(noteFromPouchDoc)
  console.debug(`[pouch] hydrating notes`, notes)
  state.noteList.replace(notes)
}

function reset() {
  state.noteList.clear()
  state.selectedNoteId = null
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

const setNoteContentDebounced = debounce(setNoteContent, 500, {
  leading: false,
  // maxWait: 10000,
  trailing: true,
})

function setSelectedNoteContent(newContent) {
  setNoteContentDebounced(newContent, state.selectedNote)
}

/*  ACTIONS  */

function combineDisposers(disposables) {
  validate('A', arguments)
  return () => {
    disposables.forEach(d => d())
  }
}

let syncDisposable = R.identity()

function createEventStream(eventName, emitter) {
  return _(eventName, emitter, arg => [eventName, arg])
}

function multiEventStream(eventNames, emitter) {
  const eventStreams = eventNames.map(n => createEventStream(n, emitter))
  return _(eventStreams).merge()
}

async function setPouchUrlAndStartSync(newUrl) {
  validate('S', arguments)
  state.pouchRemoteUrl = newUrl

  syncDisposable()

  if (!newUrl.startsWith('http://')) {
    throw new Error('Invalid Pouch URL' + newUrl)
  }

  const sync = notesDb.sync(newUrl, {
    live: true,
    retry: true,
  })

  const remote = new PouchDb(newUrl)
  remote
    .info()
    .then(console.log)
    .catch(console.error)

  if (process.env.NODE_ENV !== 'production') {
    window.remote = remote
  }

  // multiEventStream(
  //   ['change', 'paused', 'active', 'denied', 'complete', 'error'],
  //   sync,
  // ).each(console.log)
  if (process.env.NODE_ENV !== 'production') {
    window.sync = sync
  }
  sync
    .on('change', function(info) {
      // handle change
      console.log('change', info)
    })
    .on('paused', function(err) {
      // replication paused (e.g. replication up to date, user went offline)
      console.log('paused', err, this)
    })
    .on('active', function() {
      // replicate resumed (e.g. new changes replicating, user went back online)
      console.log('active')
    })
    .on('denied', function(err) {
      // a document failed to replicate (e.g. due to permissions)
      console.log('denied', err)
    })
    .on('complete', function(info) {
      // handle complete
      console.log('complete', info)
    })
    .on('error', function(err) {
      // handle error
      console.log('error', err)
    })

  syncDisposable = function() {
    sync.cancel()
    syncDisposable = R.identity
  }

  // const notesDbInfo = await notesDb.info()
  // console.log(`notesDbInfo`, notesDbInfo)

  // sync.cancel(); // whenever you want to cancel
}

const actions = wrapActions({
  async init() {
    hydrateUIState()
    await hydrateFromPouchDb()
    return combineDisposers([
      m.autorun(cacheUIState, { name: 'cache-ui-state' }),
      m.autorun(cacheUserSettings, { name: 'cache-user-settings' }),
    ])
  },
  addNewNote,
  reset,
  setSelectedNote,
  setSelectedNoteContent,
  setPouchUrlAndStartSync,
})

actions.init().catch(console.error)

/*  HOOKS  */

export function useAppState() {
  return state
}

export function useAppActions() {
  return actions
}

export function useAppStore() {
  return [state, actions]
}
