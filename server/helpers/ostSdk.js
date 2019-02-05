"use strict";

const config = require("../../config/config");
const OstSdk = require("@ostdotcom/ost-sdk-js");

module.exports = new OstSdk({
  apiKey: config.ostSdk.apiKey,
  apiSecret: config.ostSdk.apiSecret,
  apiEndpoint: config.ostSdk.endPoint
});
