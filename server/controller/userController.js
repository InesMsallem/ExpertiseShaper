const validator = require("validator");
const jwt = require("jsonwebtoken");
const { signAccessToken } = require("../middleware/auth");
const User = require("../model/userModel");
const svgCaptcha = require("svg-captcha");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt")





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
  user.expireToken = Date.now() + 600000; //10 minutes

  try {
    const saveToken = await user.save();
    const userId = user._id

    // Send email to user with reset link
    const resetLink = `http://localhost:3000/reset-password/${saveToken.resetToken}`;
    const mailOptions = {
      from: "expertiseshaper@gmail.com",
      to: email,
      subject: "Reset your password",
      html: `
<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                          
                        
                          
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply send you your old password. A unique link to reset your
                                            password has been generated for you. To reset your password, click the
                                            following link and follow the instructions.
                                        </p>
                                        <a href="${resetLink}"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.ExpertiseShaper.com</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>

</html>`,
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


/* const resetPassword = async (
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
}; */

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ resetToken });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.resetToken !== resetToken) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    if (Date.now() > user.expireToken) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: null,
      expireToken: null
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Something went wrong' });
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
  resetPassword
};
