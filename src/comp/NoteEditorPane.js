import React, { useCallback, useLayoutEffect, useRef } from 'react'
import { useWindowSize } from '../hooks/global-listeners'
import { observer } from 'mobx-react-lite'
import { useAppStore } from '../state'
import MonacoEditor from 'react-monaco-editor'

function turnOffTabFocusMode(codeEditor) {
  const internalEditorOptions = codeEditor.getConfiguration()
  const tabFocusMode = internalEditorOptions.tabFocusMode
  // console.log(`codeEditor.getConfiguration()`, internalEditorOptions)

  // console.log(
  //   `editor.getSupportedActions()`,
  //   editor.getSupportedActions().length,
  // )
  // const action = codeEditor.getAction('editor.action.toggleTabFocusMode')
  // // console.log(`action`, action)
  // const actionResult = await action.run()
  // console.log(
  //   `[actionResult] editor.action.toggleTabFocusMode`,
  //   actionResult,
  // )

  if (tabFocusMode) {
    codeEditor
      .getAction('editor.action.toggleTabFocusMode')
      .run()
      .catch(console.error)
  }
}

function useMonacoEditor() {
  const codeEditorRef = useRef(null)
  const windowSize = useWindowSize()

  useLayoutEffect(() => {
    const codeEditor = codeEditorRef.current
    if (codeEditor) {
      codeEditor.layout()
    }
  }, [windowSize, codeEditorRef.current])

  const editorWillMount = useCallback(monaco => {
    // console.log(`monaco.editor`, monaco.editor)
    // monaco.editor.onDidCreateEditor(codeEditor => {
    //   turnOffTabFocusMode(codeEditor)
    // })
  }, [])

  const editorDidMount = useCallback(async codeEditor => {
    codeEditorRef.current = codeEditor

    turnOffTabFocusMode(codeEditor)
  }, [])

  return [editorWillMount, editorDidMount, codeEditorRef]
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
