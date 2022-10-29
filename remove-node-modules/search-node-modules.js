const path = require('path')
const process = require('process')
const fs = require('fs')

const REMOVE_FOLDER = 'node_modules'
const FILE_NAME = 'removeNodeModules.json'
const mainRoute = process?.argv?.at(2) ?? null

const isDirFilter = (dir) => dir.isDirectory()

const getDirectories = async (source, filter) =>
  (await fs.promises.readdir(source, { withFileTypes: true })).filter(filter)

const createDirObject = ({ name }) => ({
  name: name,
  route: path.join(mainRoute, name)
})

const createMapObject = (obj) => obj.map(createDirObject)

const isNodeModulesDir = (nm) => (obj) =>
  obj
    .map(({ name }) => ({
      ...createDirObject({ name: nm }),
      haveNodeModules: name?.toUpperCase() === REMOVE_FOLDER.toUpperCase()
    }))
    .filter(({ haveNodeModules }) => haveNodeModules === true)

const initSearchNodeModules = async () => {
  if (mainRoute != null) {
    const directories = await getDirectories(mainRoute, isDirFilter)
      .then(createMapObject)
      .catch((err) => console.error({ err }))
    const checkNodeModules = await Promise.all(
      directories.map(({ name, route }) =>
        getDirectories(route, isDirFilter).then(isNodeModulesDir(name))
      )
    )
    const removeNodeModulesDirs = checkNodeModules
      .filter((item) => item.length)
      .flat()
      .map(({ haveNodeModules, ...rest }) => ({
        ...rest,
        removeNodeModules: false
      }))
    fs.writeFileSync(
      FILE_NAME,
      JSON.stringify({ removeNodeModulesDirs }, null, 2)
    )
  }
}

initSearchNodeModules()
