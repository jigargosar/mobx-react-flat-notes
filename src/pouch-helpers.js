import PouchDb from 'pouchdb-browser'
import * as R from 'ramda'
import { renameKeys } from './ramda-helpers'
import isUrl from 'is-url-superb'
import { fromKefirStream } from './mobx/mobx-helpers'
import { multiEventStream } from './kefir-helpers'

export async function pouchFetchDocs(db) {
  const { rows } = await db.allDocs({ include_docs: true })
  return rows.map(R.prop('doc'))
}

const allDocsHelperPlugin = {
  _fetchAll: function() {
    return pouchFetchDocs(this)
  },
  getAllDocsNormalizedP: async function() {
    const db = this
    const { rows } = await db.allDocs({ include_docs: true })
    return rows.map(
      R.pipe(
        R.prop('doc'),
        renameKeys({ _id: 'id', _rev: 'rev' }),
      ),
    )
  },
  async deleteAllDocsP() {
    const db = this
    const docs = await db._fetchAll()
    const deleteRes = await db.bulkDocs(
      docs.map(R.mergeLeft({ _deleted: true })),
    )
    console.debug(`deleteRes`, deleteRes)
  },
}

PouchDb.plugin(allDocsHelperPlugin)
PouchDb.plugin(require('pouchdb-adapter-memory'))

export { PouchDb }

export const notesDb = new PouchDb('flat-notes-db')

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

export function isValidRemotePouchUrl(remoteUrl) {
  return isUrl(remoteUrl) && R.test(/^https?:\/\//i)(remoteUrl)
}

export function createSyncStateFromStream(sync) {
  const pickSyncProps = R.pick([
    'canceled',
    'push',
    'pull',
    'pushPaused',
    'pullPaused',
  ])

  return fromKefirStream(
    multiEventStream(sync, [
      'change',
      'paused',
      'active',
      'denied',
      'complete',
      'error',
    ]).map(([eventName, value]) => {
      const error = ['denied', 'error'].includes(eventName) ? value : null
      return {
        error,
        eventName,
        ...pickSyncProps(sync),
      }
    }),
    null,
  )
}

export async function fetchAllDocs(db) {
  return (await db.allDocs({ include_docs: true })).rows.map(R.prop('doc'))
}
