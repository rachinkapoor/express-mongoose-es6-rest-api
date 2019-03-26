const express = require("express");
const tokenCtrl = require("./token.controller");
const router = express.Router({ mergeParams: true });

router
  .route("/")

  /** GET /api/token - Get tokens */
  .get((req, res) => {
    tokenCtrl.get(req, res);
  });

module.exports = router;
