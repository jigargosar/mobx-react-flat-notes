import { newNote, Note, NoteStore } from './root-store'
import { getSnapshot } from 'mobx-state-tree'
import PouchDB from 'pouchdb-browser'

describe('NoteStore Smoke Tests', function() {
  test('NoteStore.create', async () => {
    NoteStore.create()
  })

  test('NoteStore.addNote', async () => {
    PouchDB.plugin(require('pouchdb-adapter-memory'))
    const notesDb = new PouchDB('notesDb-test', { adapter: 'memory' })

    const noteStore = NoteStore.create({}, { notesDb })
    noteStore.addNew()

    await notesDb.destroy()
  })
  test('NoteStore.hydrate', async () => {
    PouchDB.plugin(require('pouchdb-adapter-memory'))
    const notesDb = new PouchDB('notesDb-test', { adapter: 'memory' })

    await notesDb.put(Note.create(newNote()).asPouch)

    const noteStore = NoteStore.create({}, { notesDb })
    noteStore.addNew()
    await noteStore.hydrate()
    console.log(`noteStore.map`, getSnapshot(noteStore.map))

    await notesDb.destroy()
  })
})
