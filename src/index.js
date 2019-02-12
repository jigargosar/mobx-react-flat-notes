import * as R from 'ramda'

const oldError = console.error
const oldWarn = console.warn

console.error = R.converge(R.identity, [
  oldError,
  (...args) => {
    // console.log(...args)
    // use this place to send notifications, or collect errors.
  },
])
console.warn = function(...a) {
  oldWarn(...a)
}

require('./render')
