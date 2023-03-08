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
    "mongodb+srv://ahmed:admin@nodeapi.i8w0wza.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("CONNECTED TO DB"))
  .then(() => app.listen(8080, () => {
    console.log('Server is listening on port 8080')
  }))
  .catch((err) => console.log(err));

app.use(express.json());

app.use("/user", userRouter);

