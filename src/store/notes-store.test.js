import PouchDb from 'pouchdb-browser'

PouchDb.plugin(require('pouchdb-adapter-memory'))

//
//
test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})

test('pouch', async () => {
  const db = new PouchDb('Foo')
  const info = await db.info()
  console.log(`info`, info)
})
