export function turnOffTabFocusMode(codeEditor) {
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
