const express = require("express");
const mongoose = require("mongoose");
const app = express();
const courseRouter = require("./route/courseRoute")
const sessionRouter = require("./route/sessionRoute")
const userRouter = require("./route/userRoute")

//connecting to db
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://mslmines:295540nn45@cluster0.ejgter0.mongodb.net/backend-expertise?retryWrites=true&w=majority"
  )
  .then(() => console.log("CONNECTED TO DB"))
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));

app.use(express.json())
app.use("/courses",courseRouter)
app.use("/sessions",sessionRouter)
app.use("/user",userRouter)
