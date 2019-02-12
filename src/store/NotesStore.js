import * as m from 'mobx'
import { wrapActions } from '../mobx/mobx-helpers'
import nanoid from 'nanoid'
import faker from 'faker'
import validate from 'aproba'

function validateNoteProps({ _id, _rev, title, content }) {
  validate('SSS', [_id, title, content])
  validate('S|Z', [_rev])
}

function Note(props) {
  console.assert(!m.isObservable(props))
  validateNoteProps(props)

  const id = props._id
  const n = m.extendObservable(
    props,
    {
      get id() {
        return n._id
      },
      get rev() {
        return n._rev
      },
      setRev(rev) {
        n._rev = rev
      },
    },
    null,
    { name: `Note:${id}` },
  )
  console.debug('created Note', n)
  return n
}

function newNoteObs() {
  return Note({
    _id: `NID:${nanoid()}`,
    _rev: null,
    title: faker.name.lastName(null),
    content: faker.lorem.lines(),
  })
}

export function NotesStore() {
  const lookup = m.observable.map({})
  const put = note => {
    note = m.isObservable(note) ? note : Note(note)
    return m.set(lookup, note.id, note)
  }
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
          const note = newNoteObs()
          put(note)
          return note
        },
        setRev(rev, id) {
          ns.byId(id).setRev(rev)
        },
        setContent(c, id) {
          const n = ns.byId(id)
          validate('O', n)
          n.content = c
          return n
        },
      }),
    },
    null,
    { name: 'NotesStore' },
  )
  console.debug('created NotesStore', ns)
  return ns
}
