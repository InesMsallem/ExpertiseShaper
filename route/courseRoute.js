const express = require("express");
const router = express.Router();
const courseController= require('../controller/courseController')
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getById);
router.post("/", courseController.addCourse);
router.delete("/:id", courseController.deleteCourse);
router.put("/:id", courseController.updateCourse);
router.post("/addCourseToUser/:userId/courses/:courseId", courseController.addCourseToUser);
router.get("/:courseId/students", courseController.getUserOfCourse);


module.exports = router;
