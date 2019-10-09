const path = require(`path`)
const fs = require(`fs-extra`)
const chokidar = require(`chokidar`)
const report = require(`gatsby-cli/lib/reporter`)

exports.createPagesStatefully = async ({ store, actions }, options, done) => {
  if (process.env.NODE_ENV !== `production`) {
    const { program } = store.getState()
    const { createPage } = actions
    const source = path.join(__dirname, `./raw_dev-404-page.js`)
    const destination = path.join(
      program.directory,
      `.cache`,
      `dev-404-page.js`
    )
    const copy = () => fs.copy(source, destination)
    await copy()
    createPage({
      component: destination,
      path: `/dev-404-page/`,
    })
    report.log(`dev-404-page: start chokidar.watch() instance, wait for ready`)
    chokidar
      .watch(source)
      .on(`change`, () => {
        report.log(`dev-404-page: chokidar.watch.change() event`)
        copy()
      })
      .on(`ready`, () => {
        report.log(
          `dev-404-page: chokidar.watch.ready() state change, continue...`
        )
        done()
      })
  } else {
    done()
  }
}
