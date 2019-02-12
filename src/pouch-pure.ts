import PouchDb from 'pouchdb-browser'

export async function pouchFetchDocs(db: PouchDb) {
  const { rows } = await db.allDocs({ include_docs: true })
  return rows.map(row => row.doc)
}
