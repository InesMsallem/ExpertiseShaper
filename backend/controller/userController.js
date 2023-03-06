const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signAccessToken } = require("../middleware/auth");
const User = require("../model/userModel");
const svgCaptcha = require("svg-captcha");
const express = require("express");
const catchAsyncErrors = require("./../middleware/catchAsyncErrors");
const textflow = require("textflow.js");
textflow.useKey("P1y83bzDKnKuKeIZdEs3vmMkyK7aagRCQte6eBPq8ah2ftQrve5kfAizZqANjsua"); // dont forget to change this

//show captcha value in console
const showCaptcha = (req, res, next) => {
  console.log(req.session.captcha);
};
// Sign up user with captcha verification
const signup = async (req, res) => {
  let user;
  var userCaptcha = req.body.captcha;
  var captchaverif = req.session.captcha;

  console.log("captcha value:", req.session.captcha);
  console.log("request captcha:", userCaptcha);
  console.log("session captcha:", captchaverif);

  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      throw new Error("name, email, and password are required");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!userCaptcha || userCaptcha.trim() === "") {
      throw new Error("Please enter the captcha value");
    }
    if (userCaptcha !== captchaverif) {
      console.log("captcha value incorrect");
      throw new Error("Captcha not correct");
    }
    user = new User({
      name,
      email,
      password,
      role,
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, "abc123");
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//get user by id
const getById = async (req, res, next) => {
  const id = req.params.id;
  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    console.log(err);
  }
  if (!user) {
    return res.status(404).json({ message: "No user found" });
  }
  return res.status(200).json({ user });
};
//get all users
const Userslist = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
  }
  if (!users) {
    return res.status(404).json({ message: "No users found" });
  } else {
    return res.status(200).json({ users });
  }
};

// Update user
const updateUser = async (req, res) => {
  const connectUserId = req.auth.userId;

  User.findById(connectUserId).then((user) => {
    const { name, email, password } = req.body;
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    User.findByIdAndUpdate(
      req.params._id,
      { name, email, password },
      { new: true }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User updated successfully" });
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  });
};

//Delete user
const deleteUser = (req, res) => {
  const connectUserId = req.auth.userId;

  User.findById(connectUserId).then((user) => {
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    User.findByIdAndRemove(req.params._id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  });
};
// Generate captcha and store in session
const generateCaptcha = (req, res) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.type("svg").send(captcha.data);
};

//login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "No user found",
      });
    }

    // const passwordMatches = await bcrypt.compare(password, user.password);
    // if (!passwordMatches) {
    //   return res.status(401).json({
    //     message: "Password does not match",
    //   });
    // }
    const passwordMatches = password == user.password;

    const accessToken = await signAccessToken(user.id);
    if (passwordMatches) {
      res.status(200).json({
        message: "Login successful",
        accessToken,
        user,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error logging in",
      error: error.message || "Internal server error",
    });
  }
};
const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});
const sendVerificationCode = async(req, res) =>{

  const {phone_number, password} = req.body;

  const verificationOptions ={
      service_name: 'My super cool app',
      seconds: 600,
  }

  const result = await textflow.sendVerificationSMS(phone_number, verificationOptions);

  return res.status(result.status).json(result.message)

}

const verifyCode = async(req, res) =>{

  const {phone_number, code} = req.body;


  let result = await textflow.verifyCode(phone_number, code); 

  if(result.valid)
  {
      // your server logic
      return res.status(200).json(result.message)
  }
  return res.status(result.status).json(result.message)
  }



module.exports = {
  Userslist,
  getById,
  updateUser,
  signup,
  login,
  deleteUser,
  generateCaptcha,
  showCaptcha,
  logout,
  sendVerificationCode,
  verifyCode
};
