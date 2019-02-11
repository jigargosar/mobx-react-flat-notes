import nanoid from 'nanoid'
import faker from 'faker'
import { types as t } from 'mobx-state-tree'

const Note = t.model('Note', {
  id: t.reference,
  rev: t.maybe(t.string),
  title: t.string,
  content: t.string,
})

function newNote() {
  return Note.create({
    id: `N__${nanoid()}`,
    rev: null,
    title: faker.name.lastName(null),
    content: faker.lorem.lines(),
  })
}

const noteFromPouchDoc = ({ _id, _rev, ...otherProps }) =>
  Note.create({
    id: _id,
    rev: _rev,
    ...otherProps,
  })

const NoteStore = t
  .model('NoteStore', {
    map: t.map(Note),
  })
  .actions(self => {
    return {
      addNew: () => self,
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
