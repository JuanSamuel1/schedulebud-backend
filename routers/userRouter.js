const express = require("express");
const router = express.Router();

const {
    Register,
    VerifyRegistration,
    Login,
    Logout
} = require("../services/userService");

router.post("/register", Register);
router.get("/verify/:confirmationCode", VerifyRegistration);
router.post("/login", Login);
router.post("/logout", Logout);

module.exports = router;
