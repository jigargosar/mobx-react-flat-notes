import { observer } from 'mobx-react-lite'
import { useAppActions, useAppState } from '../state'
import React, { useRef } from 'react'
import useFocusRef from '@jigargosar/use-focus'
import { useArrowKeys } from '../hooks/useArrowKeys'

const NoteItem = observer(({ note }) => {
  const state = useAppState()
  const actions = useAppActions()
  const isSelected = state.isNoteSelected(note)
  const shouldFocus = state.shouldFocusNote(note)
  const selectNote = () => actions.setSelectedNote(note)
  const selectedClass = isSelected ? 'bg-light-blue ' : ''
  const titleRef = useRef(null)

  useFocusRef(titleRef, shouldFocus, [shouldFocus])

  return (
    <div onClick={selectNote}>
      <div
        ref={titleRef}
        className={`pv1 ph2 ${selectedClass}`}
        tabIndex={isSelected ? 0 : -1}
        data-is-focusable={true}
        onFocus={selectNote}
      >
        {note.title}
        {note.rev}
      </div>
    </div>
  )
})
NoteItem.displayName = 'NoteItem'
export const NoteListSideBar = observer(() => {
  const state = useAppState()
  const listRef = useRef(null)
  useArrowKeys(listRef)
  return (
    <div ref={listRef} className="h-100 pv2">
      {state.displayNotes.map(note => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  )
})

NoteListSideBar.displayName = 'NoteListSideBar'
