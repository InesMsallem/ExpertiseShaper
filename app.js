const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./route/auth");
const contractRoute = require("./route/contract-routes");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./route/userRoute");
const session = require("express-session");

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(
  session({
    secret: "abc1234",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

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
app.use("/auth", authRoute);
app.use("/contract", contractRoute);

