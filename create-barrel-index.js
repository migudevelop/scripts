const path = require('path')
const process = require('process')
const { readdirSync, writeFileSync } = require('fs')

const EXPORTS_TYPES = {
  DEFAULT: `export { default as NAME } from 'FILE_NAME'`,
  ALL: `export * from 'FILE_NAME'`
}

const mainRoute = process?.argv?.at(2) ?? null
const EXTENSION = process?.argv?.at(3) ?? 'js'
const FILE_NAME = `index.${EXTENSION?.trim()?.toLowerCase()}`
const exportType = process?.argv?.at(4)?.toUpperCase() ?? 'ALL'
const replaceIndex = process?.argv?.at(5) ?? false

const isDirFilter = (dir) => dir.isDirectory()
const isFileFilter = (dir) => !dir.isDirectory()

const getDirectories = (source, filter) =>
  readdirSync(path.resolve(source), { withFileTypes: true }).filter(filter)

const getAllDirectoriesList = (source) => {
  let routes = []
  const directories = getDirectories(source, isDirFilter)
  for (const dir of directories) {
    routes.push(path.resolve(`${source}/${dir.name}`))
    routes = [...routes, ...getAllDirectoriesList(`${source}/${dir.name}`)]
  }
  return routes
}

const getFiles = (source) => getDirectories(source, isFileFilter)
const createFilesMap = (directories) => {
  let map = new Map()
  for (const dir of directories) {
    const files = getFiles(dir).map(({ name }) => name)
    map.set(dir, files)
  }
  return map
}

const createFileContent = (file) =>
  exportType === 'ALL'
    ? EXPORTS_TYPES[exportType].replace('FILE_NAME', file)
    : EXPORTS_TYPES[exportType]
        .replace('NAME', file.substring(0, file.indexOf('.')))
        .replace('FILE_NAME', file)

const createFileIndex = (source, files) => {
  let text = ''
  files?.forEach((file) => {
    text += `${createFileContent(file)}\n`
  })
  writeFileSync(path.resolve(`${source}/${FILE_NAME}`), text)
}

const removeIndex = (files) =>
  files?.filter((file) => !['index.ts', 'index.js'].includes(file))

const init = async () => {
  if (mainRoute != null) {
    const allDirs = getAllDirectoriesList(mainRoute)
    const filesMap = createFilesMap(allDirs)
    filesMap.forEach((values, key) => {
      if (!values?.includes(FILE_NAME) || replaceIndex) {
        const filterFiles = removeIndex(values)
        createFileIndex(key, filterFiles)
      }
    })
  }
}

init()
