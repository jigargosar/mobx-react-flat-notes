import { wrapActions } from './mobx/mobx-helpers'
import * as R from 'ramda'
import validate from 'aproba'
import * as m from 'mobx'
import { invariant } from 'mobx-utils'
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
import { NotesStore } from './store/NotesStore'
import { ToastStore } from './store/ToastStore'

function EditorStore({ id, rev, content }) {
  const es = m.observable.object(
    {
      id,
      rev,
      content,
      ...wrapActions({
        setContent(content) {
          es.content = content
        },
        async save() {
          const note = s.ns.setContent(es.content, id)
          const { rev } = await notesDb.put(note)
          s.ns.setRev(rev, note.id)
          es.rev = rev
        },
      }),
    },
    null,
    { name: 'EditorStore' },
  )
  console.debug(`'created EditorStore'`, 'created EditorStore')
  return es
}

function ViewStore() {
  const vs = m.observable.object(
    {
      es: null,
    },
    null,
    { name: 'ViewStore' },
  )
  console.debug(`'created ViewStore'`, 'created ViewStore')
  return vs
}

function createState() {
  const s = m.observable.object(
    {
      ts: ToastStore(),
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
        const selectedById = s.ns.byId(s.selectedNoteId)
        return selectedById || s.ns.first
      },
      get selectedNoteContent() {
        return idx(s, _ => _.selectedNote.content)
      },
      isNoteSelected: note => R.eqProps('id', note, s.selectedNote),
      shouldFocusNote: note => s.isNoteSelected(note),
    },
    null,
    {
      name: 'App State',
    },
  )

  return s
}

const s = createState()
if (process.env.NODE_ENV !== 'production') {
  window.s = s
}

// m.autorun(() => {
//   console.log(`state.syncState`, state.syncState)
// })

/*  STATE ACTIONS HELPERS  */

function hydrateUIState() {
  const uiState = getCached('app-ui-state')
  if (uiState) {
    s.selectedNoteId = uiState.selectedNoteId
  }
  const settings = getCached('app-user-settings')
  if (settings) {
    s.pouchRemoteUrl = settings.pouchRemoteUrl
  }
}

const pickUIState = R.pick(['selectedNoteId'])

function cacheUIState() {
  setCache('app-ui-state', pickUIState(s))
}

const pickUserSettings = R.pick(['pouchRemoteUrl'])

function cacheUserSettings() {
  setCache('app-user-settings', pickUserSettings(s))
}

async function hydrateFromPouchDb() {
  const allDocsRes = await notesDb.allDocs({ include_docs: true })
  const notes = allDocsResultToDocs(allDocsRes)
  console.debug(`[pouch] hydrating notes`, notes)
  s.ns.replace(notes)
}

function reset() {
  s.ns.replace([])
  s.selectedNoteId = null
  return deleteAllDocs(notesDb)
}

function setSelectedNote(note) {
  validate('O', arguments)
  s.selectedNoteId = note.id
}

async function addNewNote() {
  const note = s.ns.addNew()
  setSelectedNote(note)
  const { rev } = await notesDb.put(note)
  s.ns.setRev(rev, note.id)
}

async function setNoteContent(newContent, { id }) {
  const note = s.ns.setContent(newContent, id)
  const { rev } = await notesDb.put(note)
  s.ns.setRev(rev, note.id)
}

const setNoteContentDebounced = debounce(setNoteContent, 500, {
  leading: false,
  // maxWait: 10000,
  trailing: true,
})

function setSelectedNoteContent(newContent) {
  const selectedNote = s.selectedNote
  invariant(
    selectedNote,
    "Can't set selectedContent unless there is selectedNote",
  )
  setNoteContentDebounced(newContent, selectedNote)
}

/*  ACTIONS  */

function combineDisposers(disposables) {
  validate('A', arguments)
  return () => {
    disposables.forEach(d => d())
  }
}

function cancelSync() {
  const { syncRef, _syncStateFromStream } = s
  if (syncRef) {
    syncRef.cancel()
  }
  if (_syncStateFromStream) {
    _syncStateFromStream.dispose()
  }
}

async function reStartSync() {
  cancelSync()
  const remoteUrl = s.pouchRemoteUrl

  if (!isValidRemotePouchUrl(remoteUrl)) return

  try {
    s.syncRef = notesDb.sync(remoteUrl, {
      live: true,
      retry: true,
    })
    s._syncStateFromStream = createSyncStateFromStream(s.syncRef)
  } catch (e) {
    console.error(`e`, e)
    s._syncStateFromStream = {
      current: { error: e },
      dispose: R.identity,
    }
  }
}

async function setPouchUrlAndStartSync(newUrl) {
  validate('S', arguments)
  cancelSync()
  s.pouchRemoteUrl = newUrl

  await reStartSync()
}

const logErr = function(...a) {
  console.error(...a)
  s.ts.addMsg(a[0].message)
}

const actions = wrapActions({
  logErr,
  async init() {
    hydrateUIState()
    await hydrateFromPouchDb()
    reStartSync().catch(logErr)
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

actions.init().catch(actions.logErr)

/*  HOOKS  */

export function useAppStore() {
  return [s, actions]
}
