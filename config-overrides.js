const {
  override,
  addDecoratorsLegacy,
  babelInclude,
} = require('customize-cra')
const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = override(
  babelInclude([
    path.resolve('src'), // make sure you link your own source
    path.resolve('node_modules/react-monaco-editor'),
  ]),
  addDecoratorsLegacy(),
  config => {
    config.plugins.push(new MonacoWebpackPlugin())
    return config
  },
)
