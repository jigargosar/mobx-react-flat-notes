import validate from 'aproba'
import React from 'react'

export function focusRef(ref) {
  validate('O', arguments)

  if (ref.current) {
    ref.current.focus()
  }
}

export const h = React.createElement
