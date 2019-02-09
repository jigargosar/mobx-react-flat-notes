import { observer } from 'mobx-react-lite'
import React from 'react'
import * as PropTypes from 'prop-types'

function mergeCls(def, cls) {
  return Object.assign({}, def, cls)
}

const flatButtonCls = {
  root:
    'pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent ba b--transparent',
}

export const FlatButton = (() => {
  function Component({ cls, label, ...p }) {
    cls = mergeCls(flatButtonCls, cls)
    return (
      <button type="button" className={cls.root} {...p}>
        {label}
      </button>
    )
  }
  Component.propTypes = {
    label: PropTypes.string.isRequired,
  }

  Component.defaultProps = {
    label: '<label>',
  }

  Component.displayName = 'FlatButton'

  return observer(Component)
})()

const primaryButtonCls = {
  root:
    'pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent bg-blue white ba b--white ',
}

export const PrimaryButton = observer(({ cls, label, ...p }) => {
  cls = mergeCls(primaryButtonCls, cls)
  return (
    <button type="button" className={cls.root} {...p}>
      {label}
    </button>
  )
})

// PrimaryButton.propTypes = {
//   label: PropTypes.string.isRequired,
// }
//
// PrimaryButton.defaultProps = {
//   label: '<label>',
// }
//
// PrimaryButton.displayName = 'PrimaryButton'
