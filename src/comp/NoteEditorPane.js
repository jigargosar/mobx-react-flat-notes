import React, { useCallback, useLayoutEffect, useRef } from 'react'
import { useWindowSize } from '../hooks/global-listeners'
import { observer } from 'mobx-react-lite'
import { useAppStore } from '../state'
import MonacoEditor from 'react-monaco-editor'
import { turnOffTabFocusMode } from '../monaco-helpers'

export const NoteEditorPane = observer(() => {
  const codeEditorRef = useRef(null)
  const windowSize = useWindowSize()

  const [state, actions] = useAppStore()

  useLayoutEffect(() => {
    const codeEditor = codeEditorRef.current
    if (codeEditor) {
      codeEditor.layout()
    }
  }, [windowSize, codeEditorRef.current])

  const editorWillMount = useCallback(monaco => {
    // console.log(`monaco.editor`, monaco.editor)
    monaco.editor.onDidCreateEditor(codeEditor => {
      // console.log(`monaco.editor.getModels()`, monaco.editor.getModels())
    })
    monaco.editor.onDidCreateModel(model => {
      // console.log(`monaco.editor.getModels()`, monaco.editor.getModels())
    })
  }, [])

  const editorDidMount = useCallback(async (codeEditor, monaco) => {
    codeEditorRef.current = codeEditor

    const model = codeEditor.getModel()
    model.updateOptions({ tabSize: 2, insertSpaces: true })
    monaco.editor.setModelLanguage(model, 'markdown')

    codeEditor.updateOptions({
      lineNumbers: 'on',
      minimap: { enabled: false },
      wordWrap: 'bounded',
      wrappingIndent: 'same',
      useTabStops: true,
      autoIndent: true,
      renderIndentGuides: false,
    })

    turnOffTabFocusMode(codeEditor)
  }, [])

  return (
    <div
      className="overflow-hidden h-100 mw-100 bg-light-pink "
      style={{ width: '34em' }}
    >
      <MonacoEditor
        editorDidMount={editorDidMount}
        editorWillMount={editorWillMount}
        value={state.selectedNoteContent}
        onChange={value => actions.setSelectedNoteContent(value)}
      />
    </div>
  )
})
NoteEditorPane.displayName = 'NoteEditorPane'
