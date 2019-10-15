const getDevelopmentCertificate = require(`devcert`).certificateFor
const report = require(`gatsby-cli/lib/reporter`)
const fs = require(`fs`)
const path = require(`path`)

const absoluteOrDirectory = (directory, filePath) => {
  // Support absolute paths
  if (path.isAbsolute(filePath)) {
    return filePath
  }
  return path.join(directory, filePath)
}

module.exports = async ({ name, certFile, keyFile, directory }) => {
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

    process.env.NODE_EXTRA_CA_CERTS = certPath
    return await {
      keyPath,
      certPath,
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }

  report.info(`setting up automatic SSL certificate (may require sudo)\n`)
  try {
    const ssl = await getDevelopmentCertificate(name, {
      returnCa: true,
      installCertutil: true,
    })
    if (ssl.ca) process.env.NODE_EXTRA_CA_CERTS = ssl.ca
    return {
      key: ssl.key,
      cert: ssl.cert,
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
