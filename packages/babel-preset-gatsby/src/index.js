const path = require(`path`)

const resolve = m => require.resolve(m)

const loadCachedConfig = cachePath => {
  let pluginBabelConfig = {}
  if (process.env.NODE_ENV !== `test`) {
    try {
      pluginBabelConfig = require(path.join(
        cachePath || path.join(process.cwd(), `./.cache`),
        `babelState.json`
      ))
    } catch (err) {
      if (err.message.includes(`Cannot find module`)) {
        // This probably is being used outside of the Gatsby CLI.
        throw Error(
          `\`babel-preset-gatsby\` has been loaded, which consumes config generated by the Gatsby CLI. Set \`NODE_ENV=test\` to bypass, or run \`gatsby build\` first.`
        )
      } else {
        throw err
      }
    }
  }
  return pluginBabelConfig
}

module.exports = function preset(_, options = {}) {
  let { targets = null, cachePath } = options

  const pluginBabelConfig = loadCachedConfig(cachePath)
  const stage = process.env.GATSBY_BUILD_STAGE || `test`

  if (!targets) {
    if (stage === `build-html` || stage === `test`) {
      targets = {
        node: `current`,
      }
    } else {
      targets = pluginBabelConfig.browserslist
    }
  }

  return {
    presets: [
      [
        resolve(`@babel/preset-env`),
        {
          loose: true,
          modules: stage === `test` ? `commonjs` : false,
          useBuiltIns: `usage`,
          targets,
        },
      ],
      [
        resolve(`@babel/preset-react`),
        {
          useBuiltIns: true,
          pragma: `React.createElement`,
          development: stage === `develop`,
        },
      ],
    ],
    plugins: [
      [
        resolve(`@babel/plugin-proposal-class-properties`),
        {
          loose: true,
        },
      ],
      resolve(`babel-plugin-macros`),
      resolve(`@babel/plugin-syntax-dynamic-import`),
      [
        resolve(`@babel/plugin-transform-runtime`),
        {
          helpers: true,
          regenerator: true,
        },
      ],
    ],
  }
}
