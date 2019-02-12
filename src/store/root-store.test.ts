import { newNote, Note, NoteStore } from './root-store'
import { getSnapshot } from 'mobx-state-tree'
import { notesDb } from '../pouch'

describe('NoteStore Smoke Tests', function() {
  test('NoteStore.create', async () => {
    NoteStore.create()
  })

  test('NoteStore.addNote', async () => {
    const noteStore = NoteStore.create({}, { notesDb })
    noteStore.addNew()
  })
  test('NoteStore.hydrate', async () => {
    notesDb.put(Note.create(newNote()).asPouch)

    const noteStore = NoteStore.create({}, { notesDb })
    noteStore.addNew()
    await noteStore.hydrate()
    console.log(`noteStore.map`, getSnapshot(noteStore.map))
  })
})
