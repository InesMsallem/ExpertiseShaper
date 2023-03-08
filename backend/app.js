const express = require("express");
const app = express();
const cors = require("cors");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();

const passportSetup = require("./passport");
const authRoute = require("./route/authgo");
const userRouter = require("./route/userRoute");


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
    "mongodb+srv://sarra:sarra123@cluster0.oeaygqs.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("CONNECTED TO DB"))
  .then(() => app.listen(9000))
  .catch((err) => console.log(err));

app.use(express.json());

app.use("/user", userRouter);
