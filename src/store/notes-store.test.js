import * as R from 'ramda'
import { PouchDb } from '../pouch-helpers'

//
test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})

test('pouch', async () => {
  const db = new PouchDb('Foo')
  const remoteDb = new PouchDb('http://127.0.0.1:5984/fn', {
    skip_setup: true,
  })
  const sync = db.sync(remoteDb)
  await sync

  console.log(`await fetchAllDocs(db)`, R.take(2)(await db.getAllDocsP()))
})
