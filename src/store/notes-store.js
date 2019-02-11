import { observable } from 'mobx'
import nanoid from 'nanoid'
import faker from 'faker'
import * as R from 'ramda'
import PouchDb from 'pouchdb-browser'

class SubStore {
  rootStore

  constructor(rootStore) {
    this.rootStore = rootStore
  }
}

class Note extends SubStore {
  @observable id
  @observable rev
  @observable title
  @observable content

  constructor(rootStore, { id, rev, title, content }) {
    super(rootStore)
    Object.assign(this, { id, rev, title, content })
  }

  static create() {
    return new Note(undefined, {
      id: `N:${nanoid()}`,
      rev: null,
      title: faker.name.lastName(null),
      content: faker.lorem.lines(),
    })
  }

  static fromPouch = R.curry(
    (rootStore, { _id, _rev, title, content }) =>
      new Note(rootStore, {
        id: _id,
        rev: _rev,
        title,
        content,
      }),
  )
}

class NotesStore extends SubStore {
  @observable list = observable.array([])

  addNew() {
    const note = Note.create(this.rootStore)
    this.list.unshift(note)
  }

  get ndb() {
    return this.rootStore.notesDb
  }

  async hydrate() {
    const notes = (await this.ndb.fetchAllDocs()).map(
      Note.fromPouch(this.rootStore),
    )
    this.list.replace(notes)
  }
}

export class NotesDb {
  db

  constructor(db) {
    this.db = db || new PouchDb('flat-notes-db')
  }

  fetchAllDocs() {
    return this.db._fetchAll()
  }
}

export class RootStore {
  @observable notesStore
  @observable notesDb

  constructor() {
    this.notesStore = new NotesStore(this)
    this.notesDb = new NotesDb()
  }

  static create() {
    return new RootStore()
  }
}
