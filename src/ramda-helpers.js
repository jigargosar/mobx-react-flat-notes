import * as R from 'ramda'
import validate from 'aproba'

export const defaultEmptyTo = def =>
  R.pipe(
    R.defaultTo(''),
    R.when(R.isEmpty, R.always(def)),
  )

export const isFunction = R.is(Function)

export const tapValidate = rawSchemas =>
  R.tap(id => validate(rawSchemas, [id]))

export function idProp(item) {
  return tapValidate('S')(item.id)
}

export function toIdLookup(initialList) {
  return initialList.reduce((acc, item) => {
    acc[idProp(item)] = item
    return acc
  }, {})
}

export const clampIdx = R.curry(function clampIdx(idx, a) {
  validate('NA', arguments)

  return R.clamp(0, a.length - 1)(idx)
})

/**
 * Creates a new object with the own properties of the provided object, but the
 * keys renamed according to the keysMap object as `{oldKey: newKey}`.
 * When some key is not found in the keysMap, then it's passed as-is.
 *
 * Keep in mind that in the case of keys conflict is behaviour undefined and
 * the result may vary between various JS engines!
 *
 * @sig {a: b} -> {a: *} -> {b: *}
 */
export const renameKeys = R.curry((keysMap, obj) =>
  R.reduce(
    (acc, key) => R.assoc(keysMap[key] || key, obj[key], acc),
    {},
    R.keys(obj),
  ),
)
