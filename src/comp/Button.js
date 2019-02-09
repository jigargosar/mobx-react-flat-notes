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

function createButtonComponent(defaultCls, displayName) {
  const Button = ({ cls: overrideCls, label, ...p }) => {
    const cls = mergeCls(defaultCls, overrideCls)

    return (
      <button type="button" className={cls.root} {...p}>
        {label}
      </button>
    )
  }
  Object.assign(Button, {
    propTypes: {
      label: PropTypes.string.isRequired,
    },
    defaultProps: {
      label: '<label>',
    },
    displayName,
  })
  return observer(Button)
}

export const FlatButton = createButtonComponent(
  flatButtonCls,
  'FlatButton',
)

const primaryButtonCls = {
  root:
    'pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent bg-blue white ba b--white ',
}

export const PrimaryButton = createButtonComponent(
  primaryButtonCls,
  'PrimaryButton',
)
