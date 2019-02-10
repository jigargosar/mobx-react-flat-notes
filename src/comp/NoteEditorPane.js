import React, { useCallback, useLayoutEffect, useRef } from 'react'
import { useWindowSize } from '../hooks/global-listeners'
import { observer } from 'mobx-react-lite'
import { useAppStore } from '../state'
import MonacoEditor from 'react-monaco-editor'

function useMonacoEditor() {
  const editorRef = useRef(null)
  const windowSize = useWindowSize()

  useLayoutEffect(() => {
    const editor = editorRef.current
    if (editor) {
      editor.layout()
    }
  }, [windowSize, editorRef.current])

  const editorWillMount = useCallback(monaco => {}, [])

  const editorDidMount = useCallback(async editor => {
    editorRef.current = editor
    // console.log(
    //   `editor.getSupportedActions()`,
    //   editor.getSupportedActions().length,
    // )
    const action = editor.getAction('editor.action.toggleTabFocusMode')
    // console.log(`action`, action)
    const actionResult = await action.run()
    console.log(
      `[actionResult] editor.action.toggleTabFocusMode`,
      actionResult,
    )
  }, [])

  return [editorWillMount, editorDidMount, editorRef]
}

export const NoteEditorPane = observer(() => {
  const [editorWillMount, editorDidMount] = useMonacoEditor()
  const [state, actions] = useAppStore()

  return (
    <div
      className="overflow-hidden h-100 mw-100 bg-light-pink "
      style={{ width: '34em' }}
    >
      <MonacoEditor
        editorDidMount={editorDidMount}
        editorWillMount={editorWillMount}
        value={state.selectedNoteContent || ''}
        onChange={value => actions.setSelectedNoteContent(value)}
        options={{
          lineNumbers: 'off',
          language: 'markdown',
          minimap: { enabled: false },
        }}
      />
    </div>
  )
})
NoteEditorPane.displayName = 'NoteEditorPane'
