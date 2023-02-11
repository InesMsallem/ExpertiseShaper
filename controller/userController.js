const User = require("../model/User");

const addUser = async (req, res, next) => {
  let user;
  const { name, email, password } = req.body;
  try {
    user = new User({
      name,
      email,
      password,
    });
    await user.save();
  } catch (err) {
    console.log(err);
  }
  if (!user) {
    return res.status(500).json({ message: "Unable to add this user" });
  }
  return res.status(200).json({ user });
};

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

exports.addUser = addUser;
exports.getById = getById;
