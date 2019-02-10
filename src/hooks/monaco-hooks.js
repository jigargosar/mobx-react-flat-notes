import { useWindowSize } from './global-listeners'
import { useLayoutEffect } from 'react'

export function useAutoSizeMonacoEditorEffect(codeEditorRef) {
  const windowSize = useWindowSize()
  useLayoutEffect(() => {
    const codeEditor = codeEditorRef.current
    if (codeEditor) {
      codeEditor.layout()
    }
  }, [windowSize, codeEditorRef.current])
}
