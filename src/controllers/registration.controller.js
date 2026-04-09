const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { registrationModel } = require("../models/registration.model");
const { eventModel } = require("../models/event.model");
const { uploadToCloudinary } = require("../utils/cloudinary");

async function register(req, res) {
  try {
    const { id: eventId } = req.params;
    const event = await eventModel.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const token = uuidv4();

    const payload = { eventId, token, data: {}, files: [] };

    if (req.body) payload.data = { ...req.body };

    if (req.files && Object.keys(req.files).length) {
      const uploaded = [];
      const fileEntries = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const f of fileEntries) {
  const uploadedRes = await uploadToCloudinary(f.path, `events/${eventId}/registrations`);
  if (uploadedRes && uploadedRes.secure_url) uploaded.push(uploadedRes.secure_url);
        try { fs.unlinkSync(f.path); } catch (e) { 
 }
      }
      payload.files = uploaded;
    }

    const reg = await registrationModel.create(payload);

    return res.status(201).json({ message: "Registered", token: reg.token, id: reg._id });
  } catch (err) {
    console.error("registration.register error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listRegistrations(req, res) {
  try {
    const { id: eventId } = req.params;
    const { page = 1, limit = 20, q, attended, paid } = req.query;

    const filter = { eventId };
    if (typeof attended !== 'undefined') filter['attendance.present'] = attended === 'true';
    if (typeof paid !== 'undefined') filter.paid = paid === 'true';
    if (q) filter['data.name'] = { $regex: q, $options: 'i' };

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const total = await registrationModel.countDocuments(filter);
    const items = await registrationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    return res.json({ total, page: parseInt(page, 10), limit: parseInt(limit, 10), items });
  } catch (err) {
    console.error("registration.listRegistrations error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function markAttendance(req, res) {
  try {
    const { id: eventId, token } = req.params;
    const reg = await registrationModel.findOne({ eventId, token });
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    reg.attendance.present = true;
    reg.attendance.at = new Date();
    if (req.user && req.user._id) reg.attendance.scannedBy = req.user._id;

    await reg.save();

    return res.json({ message: "Attendance marked", token: reg.token });
  } catch (err) {
    console.error("registration.markAttendance error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function publicCheckin(req, res) {
  try {
    const { id: eventId, token } = req.params;
    const reg = await registrationModel.findOne({ eventId, token });
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    if (!reg.attendance) reg.attendance = {};
    reg.attendance.present = true;
    reg.attendance.at = new Date();
    await reg.save();

    return res.json({ message: "Checked in", token: reg.token, registration: reg });
  } catch (err) {
    console.error("registration.publicCheckin error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, listRegistrations, markAttendance, publicCheckin };
