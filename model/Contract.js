const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const contractSchema = new Schema({
  duration: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  contractstatus: {
    type: String,
    required: true,
    default: "Approval",
    enum: ["Approval","Terminated","Cancelled"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  terminateAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Contract", contractSchema);


