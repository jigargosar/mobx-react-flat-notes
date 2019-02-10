import React, { useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useAppStore } from '../state'
import MonacoEditor from 'react-monaco-editor'
import { turnOffTabFocusMode } from '../monaco-helpers'
import { useAutoSizeMonacoEditorEffect } from '../hooks/monaco-hooks'

function setupMonacoEditor(codeEditor, monaco) {
  monaco.editor.setTheme('vs-dark')
  const model = codeEditor.getModel()
  model.updateOptions({ tabSize: 2, insertSpaces: true })
  monaco.editor.setModelLanguage(model, 'markdown')

  codeEditor.updateOptions({
    lineNumbers: 'on',
    minimap: { enabled: false },
    wordWrap: 'bounded',
    wrappingIndent: 'same',
    // useTabStops: true,
    // autoIndent: true,
    renderIndentGuides: false,
  })

  turnOffTabFocusMode(codeEditor)
}

export const NoteEditorPane = observer(() => {
  const codeEditorRef = useRef(null)

  const [state, actions] = useAppStore()

  useAutoSizeMonacoEditorEffect(codeEditorRef)

  const editorDidMount = useCallback((codeEditor, monaco) => {
    codeEditorRef.current = codeEditor
    setupMonacoEditor(codeEditor, monaco)
  }, [])

  return (
    <div
      className="overflow-hidden h-100 mw-100 bg-light-pink "
      style={{ width: '34em' }}
    >
      <MonacoEditor
        editorDidMount={editorDidMount}
        value={state.selectedNoteContent}
        onChange={actions.setSelectedNoteContent}
      />
    </div>
  )
})
NoteEditorPane.displayName = 'NoteEditorPane'
