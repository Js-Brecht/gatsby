const getDevCert = require(`devcert`).certificateFor
const report = require(`gatsby-cli/lib/reporter`)
const fs = require(`fs`)
const path = require(`path`)
const prompts = require(`prompts`)

const absoluteOrDirectory = (directory, filePath) => {
  // Support absolute paths
  if (path.isAbsolute(filePath)) {
    return filePath
  }
  return path.join(directory, filePath)
}

const getWindowsEncryptionPassword = async () => {
  report.info(
    [
      `A password is required to access the secure certificate authority key`,
      `used for signing certificates.`,
      ``,
      `If this is the first time this has run, then this is to set the password`,
      `for future use.  If any new certificates are signed later, you will need`,
      `to use this same password.`,
      ``,
    ].join(`\n`)
  )
  const results = await prompts({
    type: `password`,
    name: `value`,
    message: `Please enter the CA password`,
    validate: input => input.length > 0 || `You must enter a password.`,
  })
  return results.value
}

module.exports = async ({ name, certFile, keyFile, caFile, directory }) => {
  // check that cert file and key file are both true or both false, if they are both
  // false, it defaults to the automatic ssl
  if (certFile ? !keyFile : keyFile) {
    report.panic({
      id: `11521`,
      context: {},
    })
  }

  if (certFile && keyFile) {
    const keyPath = absoluteOrDirectory(directory, keyFile)
    const certPath = absoluteOrDirectory(directory, certFile)

    process.env.NODE_EXTRA_CA_CERTS = caFile
      ? absoluteOrDirectory(directory, caFile)
      : certPath
    return await {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }

  report.info(
    `setting up automatic SSL certificate (may require elevated permissions/sudo)\n`
  )
  try {
    const { caPath, key, cert } = await getDevCert(name, {
      getCaPath: true,
      skipCertutilInstall: true,
      ui: {
        getWindowsEncryptionPassword,
      },
    })
    if (caPath) process.env.NODE_EXTRA_CA_CERTS = caPath
    return {
      key,
      cert,
    }
  } catch (err) {
    report.panic({
      id: `11522`,
      error: err,
      context: {
        message: err.message,
      },
    })
  }

  return false
}
