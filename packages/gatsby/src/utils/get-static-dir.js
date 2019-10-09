const fs = require(`fs-extra`)
const chokidar = require(`chokidar`)
const nodePath = require(`path`)
const { store } = require(`../redux`)
const report = require(`gatsby-cli/lib/reporter`)

/**
 * copyStaticDirs
 * --
 * Copy files from the static directory to the public directory
 */
exports.copyStaticDirs = () => {
  // access the store to get themes
  const { themes, flattenedPlugins } = store.getState()
  // if there are legacy themes, only use them. Otherwise proceed with plugins
  const themesSet = themes.themes
    ? themes.themes
    : flattenedPlugins.map(plugin => {
        return {
          themeDir: plugin.pluginFilepath,
          themeName: plugin.name,
        }
      })

  themesSet
    // create an array of potential theme static folders
    .map(theme => nodePath.resolve(theme.themeDir, `static`))
    // filter out the static folders that don't exist
    .filter(themeStaticPath => fs.existsSync(themeStaticPath))
    // copy the files for each folder into the user's build
    .map(folder => fs.copySync(folder, nodePath.join(process.cwd(), `public`)))

  const staticDir = nodePath.join(process.cwd(), `static`)
  if (!fs.existsSync(staticDir)) return Promise.resolve()
  return fs.copySync(staticDir, nodePath.join(process.cwd(), `public`), {
    dereference: true,
  })
}

/**
 * syncStaticDir
 * --
 * Set up a watcher to sync changes from the static directory to the public directory
 */
exports.syncStaticDir = () => {
  const staticDir = nodePath.join(process.cwd(), `static`)
  report.log(`get-static-dir: start chokidar.watch() instance`)
  chokidar
    .watch(staticDir)
    .on(`add`, path => {
      report.log(`get-static-dir: chokidar.watch.add('${path}') event`)
      const relativePath = nodePath.relative(staticDir, path)
      fs.copy(path, `${process.cwd()}/public/${relativePath}`)
    })
    .on(`change`, path => {
      report.log(`get-static-dir: chokidar.watch.change('${path}') event`)
      const relativePath = nodePath.relative(staticDir, path)
      fs.copy(path, `${process.cwd()}/public/${relativePath}`)
    })
}
