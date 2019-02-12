import { wrapActions } from './mobx/mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import * as R from 'ramda'
import validate from 'aproba'
import * as m from 'mobx'
import {
  allDocsResultToDocs,
  createSyncStateFromStream,
  deleteAllDocs,
  isValidRemotePouchUrl,
  notesDb,
} from './pouch'
import idx from 'idx.macro'
import debounce from 'lodash.debounce'
import { getCached, setCache } from './dom-helpers'

// function validateNoteProps({ _id, _rev, title, content }) {
//   validate('SSS', [_id, title, content])
//   validate('S|Z', [_rev])
// }
//
// function Note(props) {
//   console.assert(!m.isObservable(props))
//   validateNoteProps(props)
//
//   const id = props._id
//   const n = m.extendObservable(
//     props,
//     {
//       get id() {
//         return n._id
//       },
//       get rev() {
//         return n._rev
//       },
//     },
//     null,
//     { name: `Note:${id}` },
//   )
//   console.debug('created Note', n)
//   return n
// }
//
// function newNoteObs() {
//   return Note({
//     _id: `NID:${nanoid()}`,
//     _rev: null,
//     title: faker.name.lastName(null),
//     content: faker.lorem.lines(),
//   })
// }
/*  NOTE HELPERS  */

export function createNote() {
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

function NotesStore() {
  const lk = m.observable.map({})
  const put = n => m.set(lk, n.id, n)
  const ns = m.observable.object(
    {
      get allAsList() {
        return m.values(lk)
      },
      get first() {
        return ns.allAsList[0]
      },
      byId(id) {
        return m.get(lk, id)
      },
      ...wrapActions({
        replace(lst) {
          lk.clear()
          lst.forEach(put)
        },
        addNew() {
          const note = createNote()
          put(note)
          return note
        },
        setRev(rev, id) {
          const note = ns.byId(id)
          console.assert(m.isObservable(note))
          note.rev = rev
        },
        setContent(c, id) {
          const n = ns.byId(id)
          if (n) {
            n.content = c
            return n
          }
          return null
        },
      }),
    },
    null,
    { name: 'NotesStore' },
  )
  console.debug('created NotesStore', ns)
  return ns
}

function createState() {
  const s = m.observable.object(
    {
      ns: NotesStore(),
      selectedNoteId: null,
      pouchRemoteUrl: '',
      syncRef: null,
      _syncStateFromStream: null,
      get syncState() {
        return idx(s, _ => _._syncStateFromStream.current)
      },
      get syncErrorMsg() {
        const remoteUrl = s.pouchRemoteUrl
        if (R.isEmpty(remoteUrl)) return ''
        return isValidRemotePouchUrl(remoteUrl)
          ? null
          : 'Invalid Pouch URL'
      },
      get isSyncDisabled() {
        return R.isEmpty(s.pouchRemoteUrl)
      },
      get displayNotes() {
        return s.ns.allAsList
      },
      get selectedNote() {
        const selectedById = s.getNoteById(s.selectedNoteId)
        return selectedById || s.ns.first
      },
      get selectedNoteContent() {
        return idx(s, _ => _.selectedNote.content)
      },
      isNoteSelected: note => R.eqProps('id', note, s.selectedNote),
      shouldFocusNote: note => s.isNoteSelected(note),
      getNoteById: id => s.ns.byId(s.selectedNoteId),
    },
    null,
    {
      name: 'App State',
    },
  )

  return s
}

const state = createState()
if (process.env.NODE_ENV !== 'production') {
  window.state = state
}

m.autorun(() => {
  console.log(`state.syncState`, state.syncState)
})

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
  state.ns.replace(notes)
}

function reset() {
  state.ns.replace([])
  state.selectedNoteId = null
  return deleteAllDocs(notesDb)
}

function setSelectedNote(note) {
  validate('O', arguments)
  state.selectedNoteId = note.id
}

async function addNewNote() {
  const note = state.ns.addNew()
  setSelectedNote(note)
  const { rev } = await notesDb.put(noteToPouch(note))
  state.ns.setRev(rev, note.id)
}

async function setNoteContent(newContent, { id }) {
  const note = state.ns.setContent(newContent, id)
  if (note) {
    const { rev } = await notesDb.put(noteToPouch(note))
    state.ns.setRev(rev, note.id)
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
  const { syncRef, _syncStateFromStream } = state
  if (syncRef) {
    syncRef.cancel()
  }
  if (_syncStateFromStream) {
    _syncStateFromStream.dispose()
  }
}

async function reStartSync() {
  cancelSync()
  const remoteUrl = state.pouchRemoteUrl

  if (!isValidRemotePouchUrl(remoteUrl)) return

  try {
    state.syncRef = notesDb.sync(remoteUrl, {
      live: true,
      retry: true,
    })
    state._syncStateFromStream = createSyncStateFromStream(state.syncRef)
  } catch (e) {
    console.error(`e`, e)
    state._syncStateFromStream = {
      current: { error: e },
      dispose: R.identity,
    }
  }
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
