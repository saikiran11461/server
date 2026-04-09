const { importantDateModel } = require("../models/importantDate.model");

const importantDateController = {
  list: async (req, res) => {
    try {
      const dates = await importantDateModel.find().sort({ date: 1 });
      res.status(200).json({ dates });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  get: async (req, res) => {
    try {
      const date = await importantDateModel.findById(req.params.id);
      if (!date) return res.status(404).json({ message: "Not found" });
      res.status(200).json({ date });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { title, date, description, type } = req.body;
      const newDate = await importantDateModel.create({
        title,
        date,
        description,
        type,
        createdBy: req.user.userId
      });
      res.status(201).json({ message: "Created", date: newDate });
    } catch (err) {
      res.status(400).json({ message: "Create failed", error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const updated = await importantDateModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Updated", date: updated });
    } catch (err) {
      res.status(400).json({ message: "Update failed", error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await importantDateModel.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: "Delete failed", error: err.message });
    }
  },
};

module.exports = { importantDateController };
