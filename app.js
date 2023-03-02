const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userRouter = require("./route/userRoute")
const cors = require('cors');
app.use(cors());
//connecting to db
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://mslmines:30101999@cluster0.82xmoja.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("CONNECTED TO DB"))
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));

app.use(express.json())

app.use("/user",userRouter)
