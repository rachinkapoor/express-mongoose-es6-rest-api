const express = require("express");
const validate = require("express-validation");
const paramValidation = require("../../config/param-validation");
const userCtrl = require("./user.controller");

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  /** GET /api/users - Get list of users */
  .get(userCtrl.list)

  /** POST /api/users - Create new user */
  .post(validate(paramValidation.createUser), userCtrl.create);

router
  .route("/:userId")
  /** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(userCtrl.remove);

// mount ostUser routes at /users/:userId/ost-users/
const ostUserRoutes = require("../ostUser/ostUser.route");
router.use(
  "/:userId/ost-users",
  (req, res, next) => {
    next();
  },
  ostUserRoutes
);

const userDeviceRoutes = require("../userDevice/userDevice.route");
router.use(
  "/:userId/devices",
  (req, res, next) => {
    next();
  },
  userDeviceRoutes
);

/** Load user when API with userId route parameter is hit */
router.param("userId", userCtrl.load);

module.exports = router;
