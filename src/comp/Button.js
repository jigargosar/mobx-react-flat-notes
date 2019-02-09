import { observer } from 'mobx-react-lite'
import React from 'react'
import * as PropTypes from 'prop-types'

export const FlatButton = observer(({ cls, label, ...p }) => {
  cls = Object.assign(
    {},
    {
      root: 'pv2 ph3 ma0 mh1 pointer bg-transparent ba b--transparent',
      label: 'underline-hover',
    },
    cls,
  )
  return (
    <button type="button" className={cls.root} {...p}>
      <div className={cls.label}>{label}</div>
    </button>
  )
})

FlatButton.propTypes = {
  label: PropTypes.string.isRequired,
}

FlatButton.defaultProps = {
  label: '<label>',
}

FlatButton.displayName = 'FlatButton'

export const PrimaryButton = observer(({ cls, label, ...p }) => {
  cls = Object.assign(
    {},
    {
      root:
        'pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent bg-blue white ba b--white ',
    },
    cls,
  )
  return (
    <button type="button" className={cls.root} {...p}>
      {label}
    </button>
  )
})

FlatButton.propTypes = {
  label: PropTypes.string.isRequired,
}

FlatButton.defaultProps = {
  label: '<label>',
}

FlatButton.displayName = 'FlatButton'
