const { eventModel } = require("../models/event.model");
const { uploadToCloudinary } = require("../utils/cloudinary");
const fs = require("fs");

const eventController = {
  list: async (req, res) => {
    try {
      const events = await eventModel.find().sort({ date: -1 });
      res.status(200).json({ events });
    } catch (err) {
      console.error("Event create error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  get: async (req, res) => {
    try {
      const event = await eventModel.findById(req.params.id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.status(200).json({ event });
    } catch (err) {
      console.error("Event update error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { title, description, date, category, status } = req.body;
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.path, "events");
          imageUrls.push(result.secure_url);
          fs.unlinkSync(file.path); // Remove temp file
        }
      }
      const registrationForm = req.body.registrationForm ? JSON.parse(req.body.registrationForm) : undefined;
      const event = await eventModel.create({
        title,
        description,
        date,
        images: imageUrls,
        category,
        status,
        registrationForm,
        createdBy: req.user.userId
      });
      res.status(201).json({ message: "Event created", event });
    } catch (err) {
      console.error("Event delete error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      if (req.body && req.body.registrationForm && typeof req.body.registrationForm === 'string') {
        try { req.body.registrationForm = JSON.parse(req.body.registrationForm); } catch (e) { 
 }
      }
      const event = await eventModel.findByIdAndUpdate(id, req.body, { new: true });
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.status(200).json({ message: "Event updated", event });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await eventModel.findByIdAndDelete(id);
      res.status(200).json({ message: "Event deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

module.exports = { eventController };
