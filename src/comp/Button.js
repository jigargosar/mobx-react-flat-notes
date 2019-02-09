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
    console.log(`label`, label)
    return (
      <button type="button" className={cls.root} {...p}>
        {label}
      </button>
    )
  }
  Button.propTypes = {
    label: PropTypes.string.isRequired,
  }

  Button.defaultProps = {
    label: '<label>',
  }

  Button.displayName = displayName

  return Button
}

export const FlatButton = observer(
  createButtonComponent(flatButtonCls, 'FlatButton'),
)

const primaryButtonCls = {
  root:
    'pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent bg-blue white ba b--white ',
}

export const PrimaryButton = observer(
  createButtonComponent(primaryButtonCls, 'PrimaryButton'),
)
