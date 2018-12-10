'use strict'

exports.getApi = getApi
function getApi (instance) {
  return instance.worker.api_bfx.api
}
