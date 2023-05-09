"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl.output.home);
router.get("/api", ctrl.output.api);

router.get("/search", ctrl.process.search);

router.get("/api/apidoc", ctrl.download.apidoc);

router.get("/api/makesrc", ctrl.api.makesrc);
router.get("/api/makemsg", ctrl.api.makemsg);

module.exports = router;