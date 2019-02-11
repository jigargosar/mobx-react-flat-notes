import { NoteStore } from './root-store'

describe('NoteStore Smoke Tests', function() {
  test('NoteStore.create', async () => {
    NoteStore.create()
  })

  test('NoteStore.addNote', async () => {
    const noteStore = NoteStore.create()
    noteStore.addNew()
  })
})
