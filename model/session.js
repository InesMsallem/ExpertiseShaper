const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const sessionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "course",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("session", sessionSchema);
