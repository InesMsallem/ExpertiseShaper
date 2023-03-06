const validator = require("validator");
const jwt = require("jsonwebtoken");
const { signAccessToken } = require("../middleware/auth");
const User = require("../model/userModel");
const svgCaptcha = require("svg-captcha");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const bcrypt = require("bcrypt");
const path = require("path");
//mongo user verification model
const UserVerification = require("../model/userVerification");
//unique string
const { v4: uuidv4 } = require("uuid");
const userVerification = require("../model/userVerification");

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
      verified: false,
    });
    await user.save().then((result) => {
      // handle account verification
      sendVerificationEmail(result, res);
    });
    const token = jwt.sign({ userId: user._id }, "abc123");
    // res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// send verification email
const sendVerificationEmail = ({ _id, email }, res) => {
  //url to be sent in email
  const url = "http://localhost:5000/";
  const uniqueString = uuidv4() + _id;
  //mail options
  const mailOptions = {
    from: "expertiseshaper@gmail.com",
    to: email,
    subject: "Verify your email",
    html: `<p>Verify your email adress to complete the signup and login into your account.</p>
    <p>This link <b> expires in 6 hours</b>.</p>
    <p>Click on this <a href="${url + "user/verify/" + _id + "/" + uniqueString}">link</a> to verify your email.</p>`,
  };

  // hash the unique string and save it to the database
  const saltRounds = 10;
  bcrypt.hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      // set values in userVerification model
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });
      newVerification
        .save()
        .then(() => {
          transporter.sendMail(mailOptions)
            .then(() => {
              res.json({
                
                message: "Verification email sent",
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch(() => {
      res.json({
        message: "Error occured while hashing the unique string",
      })
    });
}

// verify user email
const verifyUserEmail = async (req, res) => {
  let { userId, uniqueString } = req.params;

  userVerification
    .find({ userId })
    .then((result) => {
      if (result.length > 0) {
        // user verification record exists so we proceed to verify the email
        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        // check if the record has expired
        if (expiresAt < Date.now()) {
          // record has expired so we delete it 
          userVerification
            .deleteOne({ userId })
            .then((result) => {
              User.deleteOne({ _id: userId })
                .then(() => {
                  let message = "Verification link has expired. Please signup again";
                  res.redirect(`/user/verified/error=true&message=${message}`);
                })
                .catch((error) => {
                  let message = "Clearing expired user verification record failed";
                  res.redirect(`/user/verified/error=true&message=${message}`);
                });
            })
            .catch((error) => {
              let message = "Error occured while clearing expired user verification record";
              res.redirect(`/user/verified/error=true&message=${message}`);
            });
        } else {
          // valid record exists so we proceed to verify the email
          // first compaare the hashed unique string with the one in the database
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then(result => {
              if (result) {
                //strings match 
                User
                  .updateOne({ _id: userId }, { verified: true })
                  .then(() => {
                    userVerification
                      .deleteOne({ userId })
                      .then(() => {
                        res.sendFile(path.join(__dirname, "../views/verified.html"));
                      })
                      .catch((error) => {
                        console.log(error);
                        let message = "Error occured while finilizing successful user verification";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                      });
                  })
                  .catch(err => {
                    console.log(err)
                    let message = "Error occured while updating the user record";
                    res.redirect(`/user/verified/error=true&message=${message}`);
                  });
              } else {
                // existing record but incorrect verification details passed
                let message = "Incorrect verification details passed. Check your inbox.";
                res.redirect(`/user/verified/error=true&message=${message}`);
              }
            })
            .catch((err) => {
              console.log(err);
              let message = "Error occured while comparing the hashed unique string";
              res.redirect(`/user/verified/error=true&message=${message}`);
            });
        }
      } else {
        // user verification record does not exist
        let message = "Account record not found or has been verified already.Please signup or login to your account";
        res.redirect(`/user/verified/error=true&message=${message}`);
      }
    })
    .catch((err) => {
      console.log(err);
      let message = "Error occured while verifying the email";
      res.redirect(`/user/verified/error=true&message=${message}`);
    });
}

// verify page route
const verifyEmailPage = async (req, res) => {
  res.sendFile(path.join(__dirname, "./../views/verified.html"));
}

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


/* const forgotPassword = async ({ body: { email } }, res) => {
  //checking if email exist in the database
  const user = await User.findOne({ email });

  //  things to do if the user does not exist
  if (!user)
    return res
      .status(404)
      .json({ message: "Email does not exist.", status: "error" });

  //   generate a random token for the user
  const generatedToken = crypto.randomBytes(32);
  //   check for error
  if (!generatedToken) {
    return res.status(500).json({
      message: "An error occured. Please try again later.",
      status: "error",
    });
  }

  //   converting the token to a hexstring
  const convertTokenToHexString = generatedToken.toString("hex");

  //  set the token and expiring period for the token to the user schema
  user.resetToken = convertTokenToHexString;
  user.expireToken = Date.now() + 1800000;

  try {
    const saveToken = await user.save();
    return res.status(200).json({
      message: "add your user url that handles reset password",
      data: {
        resetToken: saveToken.resetToken,
        expireToken: saveToken.expireToken,
      },
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `An error occured while trying to save the token -> ${error}`,
    });
  }
};

const resetPassword = async ({ body: { email, resetToken, newPassword } }, res) => {
  // Find the user with the given email and reset token
  const user = await User.findOne({ email, resetToken });

  // Check if the user exists
  if (!user) {
    return res.status(404).json({ message: "Invalid reset token.", status: "error" });
  }

  // Check if the reset token has expired
  if (user.expireToken < Date.now()) {
    return res.status(400).json({ message: "Reset token has expired.", status: "error" });
  }

  // Set the user's new password and clear the reset token and expiration time
  user.password = newPassword;
  user.resetToken = undefined;
  user.expireToken = undefined;

  // Save the updated user object to the database
  try {
    const savedUser = await user.save();
    return res.status(200).json({ message: "Password reset successful.", status: "success" });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while resetting password.", status: "error" });
  }
}; */


// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "expertiseshaper@gmail.com",
    pass: "jhuosyrjxednxvcf",
  },
});

const forgotPassword = async ({ body: { email } }, res) => {
  // checking if email exists in the database
  const user = await User.findOne({ email });

  // things to do if the user does not exist
  if (!user)
    return res
      .status(404)
      .json({ message: "Email does not exist.", status: "error" });

  // generate a random token for the user
  const generatedToken = crypto.randomBytes(32);
  // check for error
  if (!generatedToken) {
    return res.status(500).json({
      message: "An error occurred. Please try again later.",
      status: "error",
    });
  }

  // converting the token to a hex string
  const convertTokenToHexString = generatedToken.toString("hex");

  // set the token and expiring period for the token to the user schema
  user.resetToken = convertTokenToHexString;
  user.expireToken = Date.now() + 1800000;

  try {
    const saveToken = await user.save();

    // Send email to user with reset link
    const resetLink = `http://localhost:3000/resetPassword/${saveToken.resetToken}`;
    const mailOptions = {
      from: "expertiseshaper@gmail.com",
      to: email,
      subject: "Reset your password",
      text: `Click the link below to reset your password:\n\n${resetLink}`,
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Reset link sent to email.",
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `An error occurred while trying to save the token -> ${error}`,
    });
  }
};


const resetPassword = async (
  { body: { email, resetToken, newPassword } },
  res
) => {
  // Find the user with the given email and reset token
  const user = await User.findOne({ email, resetToken });

  // Check if the user exists
  if (!user) {
    return res
      .status(404)
      .json({ message: "Invalid reset token.", status: "error" });
  }

  // Check if the reset token has expired
  if (user.expireToken < Date.now()) {
    return res
      .status(400)
      .json({ message: "Reset token has expired.", status: "error" });
  }

  // Set the user's new password and clear the reset token and expiration time
  user.password = newPassword;
  user.resetToken = undefined;
  user.expireToken = undefined;

  // Save the updated user object to the database
  try {
    const savedUser = await user.save();

    // Send email to user to confirm password reset
    const mailOptions = {
      from: "expertiseshaper@gmail.com",
      to: email,
      subject: "Password reset confirmation",
      text: `Your password has been successfully reset.`,
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Password reset successful.",
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `An error occurred while trying to save the updated user object -> ${error}`,
    });
  }
};



module.exports = {
  Userslist,
  getById,
  updateUser,
  signup,
  login,
  deleteUser,
  generateCaptcha,
  showCaptcha,
  forgotPassword,
  resetPassword,
  verifyUserEmail,
  verifyEmailPage
};
