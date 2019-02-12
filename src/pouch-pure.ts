export async function pouchFetchDocs(db: PouchDB.Database) {
  const { rows } = await db.allDocs({ include_docs: true })
  return rows.map(row => row.doc)
}
