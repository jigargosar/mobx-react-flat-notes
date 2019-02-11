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
import PouchDb from 'pouchdb-browser'
import { multiEventStream } from './kefir-helpers'
import { fromResource } from 'mobx-utils'

window.isUrl = isUrl

function createState() {
  const state = m.observable.object(
    {
      noteList: m.observable.array([]),
      selectedNoteId: null,
      pouchRemoteUrl: '',
      syncRef: null,
      syncStateObservable: null,
      get syncState() {
        return idx(state, _ => _.syncStateObservable.current())
      },
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
if (process.env.NODE_ENV !== 'production') {
  window.state = state
}

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

function cancelSync() {
  const { syncRef } = state
  if (syncRef) {
    syncRef.cancel()
  }
}

function createSyncStateObservable(sync) {
  const pickSyncProps = R.pick([
    'canceled',
    'push',
    'pull',
    'pushPaused',
    'pullPaused',
  ])

  let disposer = R.identity
  return fromResource(sink => {
    const sub = multiEventStream(sync, [
      'change',
      'paused',
      'active',
      'denied',
      'complete',
      'error',
    ]).observe(
      ([eventName, value]) => {
        const error = ['denied', 'error'].includes(eventName)
          ? value
          : null
        sink({
          error,
          eventName,
          ...pickSyncProps(sync),
        })
      },
      error => {
        debugger
        console.error(error)
      },
      () => {
        debugger
        console.error('end')
      },
    )

    disposer = () => sub.unsubscribe()
  }, disposer)
}

async function reStartSync() {
  cancelSync()
  const remoteUrl = state.pouchRemoteUrl

  if (!remoteUrl.startsWith('http://')) {
    throw new Error('Invalid Remote Pouch URL' + remoteUrl)
  }

  const remoteDb = new PouchDb(remoteUrl)
  const remoteInfo = await remoteDb.info()
  console.log(`remoteInfo`, remoteInfo)

  state.syncRef = notesDb.sync(remoteUrl, {
    live: true,
    retry: true,
  })
  state.syncStateObservable = createSyncStateObservable(state.syncRef)
}

async function setPouchUrlAndStartSync(newUrl) {
  validate('S', arguments)
  cancelSync()
  state.pouchRemoteUrl = newUrl

  await reStartSync()
}

const actions = wrapActions({
  async init() {
    hydrateUIState()
    await hydrateFromPouchDb()
    reStartSync().catch(console.error)
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

export function useAppStore() {
  return [state, actions]
}
