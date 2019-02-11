import { observable } from 'mobx'
import nanoid from 'nanoid'
import faker from 'faker'

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

  constructor({ id, rev, title, content }, rootStore) {
    super(rootStore)
    Object.assign(this, { id, rev, title, content })
  }

  static create() {
    return new Note({
      id: `N:${nanoid()}`,
      rev: null,
      title: faker.name.lastName(null),
      content: faker.lorem.lines(),
    })
  }
}

class NotesStore extends SubStore {
  @observable list = []

  addNew() {
    const note = Note.create(this.rootStore)
    this.list.unshift(note)
  }
}

class RootStore {
  @observable notesStore

  constructor() {
    this.notesStore = new NotesStore(this)
  }

  static create() {
    return new RootStore()
  }
}

export const rootStore = RootStore.create()
