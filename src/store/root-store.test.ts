import { newNote, Note, NoteStore } from './root-store'
import { getSnapshot } from 'mobx-state-tree'
import { createTestPouchDb } from './test-helper'

describe('NoteStore Smoke Tests', function() {
  test('NoteStore.create', async () => {
    NoteStore.create()
  })

  test('NoteStore.addNote', async () => {
    const notesDb = createTestPouchDb('notesDb')

    const noteStore = NoteStore.create({}, { notesDb })
    noteStore.addNew()

    await notesDb.destroy()
  })
  test('NoteStore.hydrate', async () => {
    const notesDb = createTestPouchDb('notesDb')

    await notesDb.put(Note.create(newNote()).asPouch)

    const noteStore = NoteStore.create({}, { notesDb })
    noteStore.addNew()
    await noteStore.hydrate()
    console.log(`noteStore.map`, getSnapshot(noteStore.map))

    await notesDb.destroy()
  })
})
