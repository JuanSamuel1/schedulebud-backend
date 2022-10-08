const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');

const {
    PostThread,
    GetThread,
    GetThreadByUser
} = require("../services/threadService");

router.post("/", verifyToken, PostThread)
router.get("/", GetThread)
router.get("/byuser", verifyToken, GetThreadByUser)

module.exports = router;