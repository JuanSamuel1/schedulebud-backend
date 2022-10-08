const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');

const { GenerateScheduleFromString } = require("../services/scheduleService");

router.post("/", GenerateScheduleFromString);

module.exports = router;