const express = require("express");
const validate = require("express-validation");
const paramValidation = require("../../config/param-validation");
const deviceCtrl = require("./userDevice.controller");

const router = express.Router({ mergeParams: true }); // eslint-disable-line new-cap

router
  .route("/")
  /** GET /api/users/:userId/devices - Get list of user devices */
  .get(deviceCtrl.list)

  /** POST /api/users/:userId/devices - Create new user device and register it with Ost-Kit */
  .post(validate(paramValidation.createUserDevice), deviceCtrl.create);

/** PUT /api/users/:userId/devices/ - Sync all user devices data with Ost-Kit */
// .put(deviceCtrl.update)

router
  .route("/:deviceAddress")
  /** GET /api/users/:userId/devices/:deviceAddress - Get user device by address */
  .get(deviceCtrl.get)

  /** DELETE /api/users/:userId/devices/:deviceAddress - Delete user device with address */
  .delete(deviceCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param("deviceAddress", deviceCtrl.load);

module.exports = router;
