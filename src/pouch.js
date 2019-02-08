import PouchDb from 'pouchdb-browser'
import * as R from 'ramda'

export const notesDb = new PouchDb('flat-notes-notesDb')

export const getDocsFromAllDocs = allDocsRes =>
  allDocsRes.rows.map(R.prop('doc'))
