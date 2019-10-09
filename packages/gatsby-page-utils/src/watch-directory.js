const Promise = require(`bluebird`)
const chokidar = require(`chokidar`)
const slash = require(`slash`)
const report = require(`gatsby-cli/lib/reporter`)

module.exports = async (path, glob, onNewFile, onRemovedFile) =>
  new Promise((resolve, reject) => {
    report.log(`gatsby-page-utils: start chokidar.watch() instance`)
    chokidar
      .watch(glob, { cwd: path })
      .on(`add`, path => {
        report.log(`gatsby-page-utils: chokidar.watch.add('${path}') event`)
        path = slash(path)
        onNewFile(path)
      })
      .on(`unlink`, path => {
        report.log(`gatsby-page-utils: chokidar.watch.unlink('${path}') event`)
        path = slash(path)
        onRemovedFile(path)
      })
      .on(`ready`, () => {
        report.log(
          `gatsby-page-utils: chokidar.watch.ready() state change, continue...`
        )
        resolve()
      })
  })
