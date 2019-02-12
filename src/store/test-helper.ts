import PouchDB from 'pouchdb-browser'

PouchDB.plugin(require('pouchdb-adapter-memory'))

export function createTestPouchDb(dbName: string) {
  return new PouchDB(`${dbName}-test`, { adapter: 'memory' })
}
