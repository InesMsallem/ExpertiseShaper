const Session = require("../model/session");
const getAllSessions = async (req, res, next) => {
  let sessions;
  try {
    sessions = await Session.find();
  } catch (err) {
    console.log(err);
  }
  if (!sessions) {
    return res.status(404).json({ message: "No sessions found" });
  } else {
    return res.status(200).json({ sessions });
  }
};

const addSession = async (req, res, next) => {
  let session;
  const { name, date, topic, duration } = req.body;
  try {
    session = new Session({
      name,
      date,
      topic,
      duration,
    });
    await session.save();
  } catch (err) {
    console.log(err);
  }
  if (!session) {
    return res.status(500).json({ message: "Unable to add this session" });
  }
  return res.status(200).json({ session });
};

const deleteSession = async (req, res, next) => {
  const id = req.params.id;
  let session;
  try {
    session = await Session.findByIdAndRemove(id);
  } catch (err) {
    console.log(err);
  }
  if (!session) {
    return res.status(404).json({ message: "Unable To Delete By this ID" });
  }
  return res.status(200).json({ message: "Session Successfully Deleted" });
};

const updateSession = async (req, res, next) => {
  const id = req.params.id;
  const { name, date, topic, duration } = req.body;
  let session;
  try {
    session = await Session.findByIdAndUpdate(id, {
      name,
      date,
      topic,
      duration,
    });
    session = await session.save();
  } catch (err) {
    console.log(err);
  }
  if (!session) {
    return res.status(404).json({ message: "Unable To Update By this ID" });
  }
  return res.status(200).json({ session });
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  let session;
  try {
    session = await Session.findById(id);
  } catch (err) {
    console.log(err);
  }
  if (!session) {
    return res.status(404).json({ message: "No Session found" });
  }
  return res.status(200).json({ session });
};

exports.getAllSessions = getAllSessions;
exports.addSession = addSession;
exports.deleteSession = deleteSession;
exports.updateSession = updateSession;
exports.getById = getById;
