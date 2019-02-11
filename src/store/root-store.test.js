import { NoteStore } from './root-store'
import { getSnapshot } from 'mobx-state-tree'

describe('NoteStore Smoke Tests', function() {
  test('NoteStore.create', async () => {
    NoteStore.create()
  })

  test('NoteStore.addNote', async () => {
    const noteStore = NoteStore.create()
    noteStore.addNew()
    console.log(`noteStore.map`, getSnapshot(noteStore.map))
  })
})
