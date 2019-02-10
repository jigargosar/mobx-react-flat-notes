import PouchDb from 'pouchdb-browser'
import * as R from 'ramda'
import { renameKeys } from './ramda-helpers'

const getAllDocsPlugin = {
  getAllDocsP: async function() {
    const { rows } = await this.allDocs({ include_docs: true })
    return rows.map(R.prop('doc'))
  },
  getAllDocsNormalizedP: async function() {
    const { rows } = await this.allDocs({ include_docs: true })
    return rows.map(
      R.pipe(
        R.prop('doc'),
        renameKeys({ _id: 'id', _rev: 'rev' }),
      ),
    )
  },
}

PouchDb.plugin(getAllDocsPlugin)

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
