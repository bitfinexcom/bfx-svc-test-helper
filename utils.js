'use strict'

exports.getApi = getApi
function getApi (instance) {
  return instance.worker.api_bfx.api
}

exports.getGrapeApiPort = getGrapeApiPort
function getGrapeApiPort (grapeHelperInstance) {
  return grapeHelperInstance.grapes[0].conf.api_port
}
