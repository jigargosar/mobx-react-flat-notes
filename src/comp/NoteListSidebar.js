import { observer } from 'mobx-react-lite'
import { useAppStore } from '../store'
import React, { useRef } from 'react'
import { useArrowKeys } from '../hooks/useArrowKeys'
import { useFocusRef } from '../hooks/useFocusRef'

const NoteItem = observer(({ note }) => {
  const [state, actions] = useAppStore()
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
        className={`pv1 ph2 word-wrap ${selectedClass}`}
        tabIndex={isSelected ? 0 : -1}
        data-is-focusable={true}
        onFocus={selectNote}
      >
        {note.title}
        <div className="f7 black-50 truncate">{note.rev}</div>
      </div>
    </div>
  )
})
NoteItem.displayName = 'NoteItem'
export const NoteListSideBar = observer(() => {
  const [state] = useAppStore()
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
