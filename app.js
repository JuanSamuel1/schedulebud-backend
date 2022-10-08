const express = require('express');
const cors = require("cors");
require("dotenv").config();

const app = express();
const userRoute = require("./routers/userRouter");
const threadRoute = require("./routers/threadRouter");
const scheduleRoute = require("./routers/scheduleRouter");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/user", userRoute);
app.use("/thread", threadRoute);
app.use("/schedule", scheduleRoute);
module.exports = app;