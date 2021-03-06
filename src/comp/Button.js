import { observer } from 'mobx-react-lite'
import * as R from 'ramda'
import { h } from '../react-helpers'

export const PrimaryButton = createButtonComponent(
  'pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent bg-blue white ba b--white',
  'PrimaryButton',
)
export const FlatButton = createButtonComponent(
  'pv2 ph3 ma0 mh1 pointer underline-hover bg-transparent ba b--transparent',
  'FlatButton',
)

export const HeaderButton = createButtonComponent(
  'pv2 ttu f7 grow underline-hover  flex items-center pointer bn bg-inherit color-inherit',
  'HeaderButton',
)
export const HeaderIconButton = createButtonComponent(
  'pv2 ttu f7 grow   flex items-center pointer bn bg-inherit color-inherit',
  'HeaderButton',
)

function createButtonComponent(className, displayName) {
  const withDefaultProps = R.pipe(
    R.mergeDeepRight({
      type: 'button',
      className,
      children: '<no-label>',
    }),
  )

  const Component = observer(props => h('button', withDefaultProps(props)))

  Component.displayName = displayName
  return Component
}
