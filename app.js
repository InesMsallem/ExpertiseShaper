const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userRouter = require("./route/userRoute");
const cors = require("cors");
const session = require("express-session");
const dotenv = require('dotenv');

// configure dotenv
dotenv.config();

// configure session middleware
app.use(
  session({
    secret: "abc1234",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(cors());

app.use(express.urlencoded({ extended: true }));

//connecting to db
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://admin:zLz9zhxfFGUVzd9Y@cluster0.qd4wkx9.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("CONNECTED TO DB"))
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));

app.use(express.json());

app.use("/user", userRouter);
