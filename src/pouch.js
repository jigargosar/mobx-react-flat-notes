import PouchDb from 'pouchdb-browser'
import * as R from 'ramda'

export const notesDb = new PouchDb('flat-notes-notesDb')

if (process.env.NODE_ENV !== 'production') {
  window.notesDb = notesDb
}

export const allDocsResultToDocs = allDocsRes => {
  console.debug(`allDocsRes`, allDocsRes)
  return allDocsRes.rows.map(R.prop('doc'))
}

export async function deleteAllDocs(db) {
  const allDocsRes = await db.allDocs({ include_docs: true })
  const deletePromises = allDocsResultToDocs(allDocsRes).map(doc =>
    notesDb.put({ ...doc, _deleted: true }),
  )
  const deleteRes = await Promise.all(deletePromises)
  console.debug(`deleteRes`, deleteRes)
  return deleteRes
}
