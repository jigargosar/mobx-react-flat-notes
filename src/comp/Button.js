import { observer } from 'mobx-react-lite'
import React from 'react'
import * as PropTypes from 'prop-types'
import * as R from 'ramda'

function mergeCls(def, cls) {
  return Object.assign({}, def, cls)
}

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

export const FlatButton = createButtonComponent(
  'pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent ba b--transparent',
  'FlatButton',
)

export const HeaderButton = createButtonComponent(
  'pv2 ttu f7 grow underline-hover  pointer bn bg-inherit color-inherit',
  'HeaderButton',
)

function createButtonComponent(className, displayName) {
  const defaultProps = R.pipe(
    R.mergeDeepRight({
      type: 'button',
      className,
      children: '<no-label>',
    }),
  )

  const Component = observer(props =>
    React.createElement('button', defaultProps(props)),
  )

  Component.displayName = displayName
  return Component
}
