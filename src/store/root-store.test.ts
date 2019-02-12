import { newNote, Note, NoteStore } from './root-store'
import { getSnapshot } from 'mobx-state-tree'
import { createTestPouchDb } from './test-helper'

async function withNotesDb(fn: Function) {
  const notesDb = createTestPouchDb('notesDb')

  await fn(notesDb)

  await notesDb.destroy()
}

describe('NoteStore Smoke Tests', function() {
  test('NoteStore.create', () => {
    NoteStore.create()
  })

  test('NoteStore.addNote', () => {
    return withNotesDb((notesDb: PouchDB.Database) => {
      const noteStore = NoteStore.create({}, { notesDb })
      noteStore.addNew()
    })
  })

  test('NoteStore.hydrate', async () => {
    return withNotesDb(async (notesDb: PouchDB.Database) => {
      await notesDb.put(Note.create(newNote()).asPouch)

      const noteStore = NoteStore.create({}, { notesDb })
      noteStore.addNew()
      await noteStore.hydrate()
      console.log(`noteStore.map`, getSnapshot(noteStore.map))
    })
  })
})
