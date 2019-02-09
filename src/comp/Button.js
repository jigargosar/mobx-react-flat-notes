import { observer } from 'mobx-react-lite'
import React from 'react'

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

export const PrimaryButton = observer(({ cls, label, ...p }) => {
  cls = Object.assign(
    {},
    {
      root:
        'pv2 ph3 ma0 mh1 pointer bg-transparent bg-blue white ba b--white',
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
