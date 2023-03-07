const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./route/authgo");
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

app.use("/auth", authRoute);

app.listen("5000", () => {
  console.log("Server is running!");
});

app.use(
  session({
    secret: "abc1234",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(cors());

app.use("/contract", contractRoute);
app.use("/user", userRouter);
//connecting to db
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://sarra:sarra123@cluster0.oeaygqs.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("CONNECTED TO DB"))
  .then(() => app.listen(6000))
  .catch((err) => console.log(err));



