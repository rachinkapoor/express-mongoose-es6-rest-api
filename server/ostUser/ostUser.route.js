const express = require("express");
const validate = require("express-validation");
const paramValidation = require("../../config/param-validation");
const ostUserCtrl = require("./ostUser.controller");
const userCtrl = require("../user/user.controller");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  /** POST /api/users/:userId/ost-users - Create user */
  .post(ostUserCtrl.create)

  /** GET /api/users/:userId/ost-users - Get user */
  .get(ostUserCtrl.get)

  /** PUT /api/users/:userId/ost-users - Update user */
  .put(ostUserCtrl.update);

module.exports = router;
