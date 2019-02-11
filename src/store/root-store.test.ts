import { NoteStore } from './root-store'
import { getSnapshot } from 'mobx-state-tree'
import { notesDb } from '../pouch-helpers'

describe('NoteStore Smoke Tests', function() {
  test('NoteStore.create', async () => {
    NoteStore.create()
  })

  test('NoteStore.addNote', async () => {
    const noteStore = NoteStore.create({}, { notesDb })
    noteStore.addNew()
    noteStore.hydrate()
    console.log(`noteStore.map`, getSnapshot(noteStore.map))
  })
  test('NoteStore.hydrate', async () => {
    notesDb.put()
    const noteStore = NoteStore.create({}, { notesDb })
    noteStore.addNew()
    await noteStore.hydrate()
    console.log(`noteStore.map`, getSnapshot(noteStore.map))
  })
})
