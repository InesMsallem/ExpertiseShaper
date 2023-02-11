const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    startdate: {
      type: Date,
      required: true,
    },
    enddate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: "session",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("course", courseSchema);
