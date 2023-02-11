const Course = require("../model/course");
const User = require("../model/User");

//const stripe = require("stripe")("sk_test_your_stripe_api_key");

const getAllCourses = async (req, res, next) => {
  let courses;
  try {
    courses = await Course.find();
  } catch (err) {
    console.log(err);
  }
  if (!courses) {
    return res.status(404).json({ message: "No courses found" });
  } else {
    return res.status(200).json({ courses });
  }
};

const addCourse = async (req, res, next) => {
  let course;
  const { name, description, category, duration, startdate, enddate, price } =
    req.body;
  try {
    course = new Course({
      name,
      description,
      category,
      duration,
      startdate,
      enddate,
      price,
    });
    await course.save();
  } catch (err) {
    console.log(err);
  }
  if (!course) {
    return res.status(500).json({ message: "Unable to add this course" });
  }
  return res.status(200).json({ course });
};

const deleteCourse = async (req, res, next) => {
  const id = req.params.id;
  let course;
  try {
    course = await Course.findByIdAndRemove(id);
  } catch (err) {
    console.log(err);
  }
  if (!course) {
    return res.status(404).json({ message: "Unable To Delete By this ID" });
  }
  return res.status(200).json({ message: "Course Successfully Deleted" });
};

const updateCourse = async (req, res, next) => {
  const id = req.params.id;
  const { name, description, category, duration, startdate, enddate, price } =
    req.body;
  let course;
  try {
    course = await Course.findByIdAndUpdate(id, {
      name,
      description,
      category,
      duration,
      startdate,
      enddate,
      price,
    });
    course = await course.save();
  } catch (err) {
    console.log(err);
  }
  if (!course) {
    return res.status(404).json({ message: "Unable To Update By this ID" });
  }
  return res.status(200).json({ course });
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  let course;
  try {
    course = await Course.findById(id);
  } catch (err) {
    console.log(err);
  }
  if (!course) {
    return res.status(404).json({ message: "No Course found" });
  }
  return res.status(200).json({ course });
};

//add aadia
const addCourseToUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res
        .status(404)
        .send(`User with id ${req.params.userId} not found.`);
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res
        .status(404)
        .send(`Course with id ${req.params.courseId} not found.`);
    }
    user.courses.push(course._id);
    course.enrolledStudents.push(user._id);
    course.save();
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getUserOfCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res
        .status(404)
        .send(`Course with id ${req.params.courseId} not found.`);
    }
    const students = await User.find({ courses: { $in: [course._id] } });
    res.send(students);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getAllCourses = getAllCourses;
exports.addCourse = addCourse;
exports.deleteCourse = deleteCourse;
exports.updateCourse = updateCourse;
exports.getById = getById;
exports.addCourseToUser = addCourseToUser;
exports.getUserOfCourse = getUserOfCourse;
