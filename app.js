const express = require('express');
const cors = require("cors");
require("dotenv").config();

const app = express();
const userRoute = require("./routers/userRouter");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/user", userRoute);
module.exports = app;