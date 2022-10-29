const path = require('path')
const fs = require('fs')

const REMOVE_FOLDER = 'node_modules'
const FILE_NAME = 'removeNodeModules.json'

const resetConsoleLogColor = () => console.log('\x1b[0m')

const removeNodeModulesFilter = ({ removeNodeModules }) =>
  removeNodeModules === true

const callbackError = (error) => {
  resetConsoleLogColor()
  console.log('\x1b[41m', error)
  resetConsoleLogColor()
}

const removeNodeModulesFn = async ({ name, route }) => {
  await fs.rm(
    path.resolve(path.join(route, REMOVE_FOLDER)),
    {
      recursive: true,
      force: true
    },
    callbackError
  )
  console.log('\x1b[32m', `${name} are removed`)
  resetConsoleLogColor()
}

const initDeleteNodeModules = async () => {
  const file = JSON.parse(
    fs.readFileSync(path.resolve(FILE_NAME), { encoding: 'utf-8' })
  )
  const removeNodeModulesDirs = file.removeNodeModulesDirs.filter(
    removeNodeModulesFilter
  )

  fs.writeFileSync(
    FILE_NAME,
    JSON.stringify({ removeNodeModulesDirs }, null, 2)
  )

  removeNodeModulesDirs.forEach(({ name, route }) =>
    removeNodeModulesFn({ name, route })
  )
}

initDeleteNodeModules()
