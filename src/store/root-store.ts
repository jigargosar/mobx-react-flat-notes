import nanoid from 'nanoid'
import faker from 'faker'
import { getEnv, types as t } from 'mobx-state-tree'
import { pouchFetchDocs } from '../pouch-pure'

export const Note = t
  .model('Note', {
    id: t.identifier,
    rev: t.maybe(t.string),
    title: t.string,
    content: t.string,
  })
  .views(self => {
    return {
      get asPouch() {
        return noteToPouch(self)
      },
    }
  })

export function newNote() {
  return Note.create({
    id: `N__${nanoid()}`,
    title: faker.name.lastName(),
    content: faker.lorem.lines(),
  })
}

type PouchNoteDoc = {
  _id: string
  _rev?: string
  title: string
  content: string
}

type NoteData = {
  id: string
  rev?: string
  title: string
  content: string
}

export function noteFromPouchDoc({
  _id,
  _rev,
  ...otherProps
}: PouchNoteDoc): NoteData {
  return Note.create({
    id: _id,
    rev: _rev,
    ...otherProps,
  })
}

function noteToPouch({ id, rev, title, content }: NoteData) {
  return { _id: id, _rev: rev, title, content }
}

export const NoteStore = t
  .model('NoteStore', {
    map: t.map(Note),
  })
  .views(self => ({
    get db() {
      return getEnv(self).notesDb
    },
  }))
  .actions(self => ({
    putAll: (notes: NoteData[]) =>
      notes.forEach((note: NoteData) => self.map.put(note)),
  }))
  .actions(self => {
    return {
      addNew: () => self.map.put(newNote()),
      hydrate: async () => {
        const docs = (await pouchFetchDocs(self.db)) as PouchNoteDoc[]
        return self.putAll(docs.map(d => noteFromPouchDoc(d)))
      },
    }
  })

// class NoteStore extends SubStore {
//   @observable list = observable.array([])
//
//   addNew() {
//     const note = Note.create(this.rootStore)
//     this.list.unshift(note)
//   }
//
//   get ndb() {
//     return this.rootStore.notesDb
//   }
//
//   async hydrate() {
//     const notes = (await this.ndb.fetchAllDocs()).map(
//       Note.fromPouch(this.rootStore),
//     )
//     this.list.replace(notes)
//   }
// }
//
// class NotesDb {
//   db
//
//   constructor({ PouchDb }) {
//     this.db = new PouchDb('flat-notes-db')
//   }
//
//   fetchAllDocs() {
//     return this.db._fetchAll()
//   }
// }
//
// export class RootStore extends MobxStore{
//   @observable notesStore
//   @observable notesDb
//
//   constructor({ PouchDb }) {
//     super(, )
//     this.notesStore = new NoteStore(this)
//     this.notesDb = new NotesDb({ PouchDb })
//   }
//
//   static create({ PouchDb = PouchDb }) {
//     return new RootStore({ PouchDb })
//   }
// }
