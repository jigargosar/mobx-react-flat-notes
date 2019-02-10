import { observer } from 'mobx-react-lite'
import React from 'react'
import * as PropTypes from 'prop-types'

function mergeCls(def, cls) {
  return Object.assign({}, def, cls)
}

export const FlatButton = observer(function FlatButton({ ...p }) {
  return (
    <button
      type="button"
      className="pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent ba b--transparent"
      {...p}
    />
  )
})

FlatButton.displayName = 'FlatButton'

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

PrimaryButton.propTypes = {
  label: PropTypes.string.isRequired,
}

PrimaryButton.displayName = 'PrimaryButton'

export const HeaderButton = observer(({ ...p }) => {
  return (
    <button
      type="button"
      className="pv2 ttu f7 grow underline-hover  pointer bn bg-inherit color-inherit"
      {...p}
    />
  )
})

HeaderButton.displayName = 'HeaderButton'
