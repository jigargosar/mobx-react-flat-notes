import { observer } from 'mobx-react-lite'
import React from 'react'
import * as PropTypes from 'prop-types'

function mergeCls(def, cls) {
  return Object.assign({}, def, cls)
}

const flatButtonCls = {
  root:
    'pv2 ph3  mh1 pointer underline-hover bg-transparent ba b--transparent',
}

function createButtonComponent(defaultCls) {
  return ({ cls: overrideCls, label, ...p }) => {
    const cls = mergeCls(defaultCls, overrideCls)

    return (
      <button type="button" className={cls.root} {...p}>
        {label}
      </button>
    )
  }
}

export const FlatButton = observer(
  Object.assign(createButtonComponent(flatButtonCls), {
    propTypes: {
      label: PropTypes.string.isRequired,
    },
    defaultProps: {
      label: '<label>',
    },
    displayName: 'FlatButton',
  }),
)

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
