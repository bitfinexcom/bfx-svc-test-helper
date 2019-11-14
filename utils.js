'use strict'

exports.getApi = getApi
function getApi (instance) {
  return instance.worker.api_bfx.api
}

exports.getGrapeApiPort = getGrapeApiPort
function getGrapeApiPort (grapeHelperInstance) {
  return grapeHelperInstance.grapes[0].conf.api_port
}

exports.getGrapeApiUrl = getGrapeApiUrl
function getGrapeApiUrl (grapes) {
  if (typeof grapes === 'string') {
    return grapes
  }

  const p = getGrapeApiPort(this.grapes)
  return 'http://127.0.0.1:' + p
}
