import React, { useCallback, useLayoutEffect, useRef } from 'react'
import { useWindowSize } from '../hooks/global-listeners'
import { observer } from 'mobx-react-lite'
import { useAppStore } from '../state'
import MonacoEditor from 'react-monaco-editor'
import { turnOffTabFocusMode } from '../monaco-helpers'

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
    monaco.editor.onDidCreateEditor(codeEditor => {
      turnOffTabFocusMode(codeEditor)
    })
  }, [])

  const editorDidMount = useCallback(async codeEditor => {
    codeEditorRef.current = codeEditor

    // codeEditor.getModel().updateOptions({ tabSize: 2, insertSpaces: true })
    return turnOffTabFocusMode(codeEditor)
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
          lineNumbers: 'on',
          language: 'markdown',
          minimap: { enabled: false },
          wordWrap: 'bounded',
          wrappingIndent: 'same',
          // useTabStops: true,
          autoIndent: true,
          renderIndentGuides: false,
        }}
      />
    </div>
  )
})
NoteEditorPane.displayName = 'NoteEditorPane'
