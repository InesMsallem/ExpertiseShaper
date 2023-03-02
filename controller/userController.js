const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signAccessToken } = require("../middleware/middleware");
const User = require("../model/userModel");
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
//signup user
const signup = async (req, res) => {
  let user;
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      throw new Error("name, email, and password are required");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format");
    }

    //const hashedPassword = await bcrypt.hash(password, 10);

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

module.exports = {
  Userslist,
  getById,
  updateUser,
  signup,
  login,
  deleteUser,
};
