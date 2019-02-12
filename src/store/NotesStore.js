import * as m from 'mobx'
import { wrapActions } from '../mobx/mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'

export function createNote() {
  return {
    id: `N:${nanoid()}`,
    rev: null,
    title: faker.name.lastName(null),
    content: faker.lorem.lines(),
  }
}

export function NotesStore() {
  const lookup = m.observable.map({})
  const put = note => m.set(lookup, note.id, note)
  const ns = m.observable.object(
    {
      get allAsList() {
        return m.values(lookup)
      },
      get first() {
        return ns.allAsList[0]
      },
      byId(id) {
        return m.get(lookup, id)
      },
      ...wrapActions({
        replace(lst) {
          lookup.clear()
          lst.forEach(put)
        },
        addNew() {
          const note = createNote()
          put(note)
          return note
        },
        setRev(rev, id) {
          const n = ns.byId(id)
          n.rev = rev
        },
        setContent(c, id) {
          const n = ns.byId(id)
          if (n) {
            n.content = c
            return n
          }
          return null
        },
      }),
    },
    null,
    { name: 'NotesStore' },
  )
  console.debug('created NotesStore', ns)
  return ns
}
