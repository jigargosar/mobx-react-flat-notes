import {
  action,
  extendObservable,
  get,
  observable,
  remove,
  set,
} from 'mobx'
import validate from 'aproba'
import * as R from 'ramda'
import { clampIdx } from '../ramda-helpers'

export function toggle(target, prop) {
  validate('OS', arguments)

  set(target, prop, !get(target, prop))
}

export function insertAtOffsetOf(item, offset, newItem, a) {
  validate('*N*A', arguments)
  const idx = R.indexOf(item)(a)
  if (idx > -1) {
    a.splice(idx + offset, 0, newItem)
  }
}

export function asActions(actionNames) {
  return actionNames.reduce((acc, name) => {
    acc[name] = action
    return acc
  }, {})
}

export function wrapActions(obj) {
  validate('O', arguments)

  return R.mapObjIndexed((fn, name) => action(name, fn))(obj)
}

export function moveItemByClampedOffset(item, offset, a) {
  validate('*NA', arguments)

  const from = a.indexOf(item)
  const to = clampIdx(from + offset, a)

  if (from < 0 || from === to) return
  a.splice(from, 1)
  a.splice(to, 0, item)
}

export function removeByIndexOf(item, a) {
  remove(a, a.indexOf(item))
}

function valueObservable(initial = null, options = {}) {
  const obs = extendObservable(
    observable.box(initial),
    {
      get val() {
        return obs.get()
      },
      set val(newVal) {
        return obs.set(newVal)
      },
      map: fn => obs.set(fn(obs.get())),
      extend: obj => extendObservable(obs, obj),
    },
    null,
    options,
  )
  return obs
}

export function boolObservable(ini) {
  const obs = valueObservable(ini).extend({
    not: () => (obs.val = !obs.val),
    on: () => obs.set(true),
    off: () => obs.set(false),
  })
  return obs
}

export function stringObservable(ini) {
  const obs = valueObservable(ini).extend({
    get trimmed() {
      return obs.get().trim()
    },
    get isBlank() {
      return obs.trimmed === ''
    },
    get bindInput() {
      return { value: obs.get(), onChange: ev => obs.set(ev.target.value) }
    },
  })
  return obs
}
