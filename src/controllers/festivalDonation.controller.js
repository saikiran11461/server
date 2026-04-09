const { festivalDonationModel } = require("../models/festivalDonation.model");

const festivalDonationController = {
  publicList: async (req, res) => {
    try {
      const festivals = await festivalDonationModel.find({}, 'title slug description images active donationOptions meta createdAt');
      if (!festivals || festivals.length === 0) {
        return res.json({ message: "Currently there are no festivals" });
      }
      res.json(festivals);
    } catch (err) {
      console.error('festivalDonationController.publicList error:', err);
      res.status(500).json({ message: "Server error" });
    }
  },
  list: async (req, res) => {
    try {
      const festivals = await festivalDonationModel.find()
        .populate('createdBy', 'name email')
        .populate('eventId');
      const donationModule = require('../models/donation.model');
      console.log('DEBUG donationModule keys:', Object.keys(donationModule));
      console.log('DEBUG donationModule content:', donationModule);
      const { donationModel } = donationModule;
      console.log('DEBUG donationModel type:', typeof donationModel);
      if (donationModel) {
        try {
          console.log('DEBUG donationModel.modelName:', donationModel.modelName);
          console.log('DEBUG donationModel.countDocuments type:', typeof donationModel.countDocuments);
        } catch (err) {
          console.error('DEBUG reading donationModel properties failed:', err);
        }
      }
      const festivalsWithDonationCount = await Promise.all(festivals.map(async (festival) => {
        let donationCount = 0;
        try {
          if (donationModel && typeof donationModel.countDocuments === 'function') {
            donationCount = await donationModel.countDocuments({ festivalId: festival._id });
          } else {
            console.warn('donationModel.countDocuments not available, defaulting donationCount to 0');
          }
        } catch (err) {
          console.error('Error counting donations for festival', festival._id, err);
        }
        return {
          ...festival.toObject(),
          event: festival.eventId,
          donationCount
        };
      }));
      res.json(festivalsWithDonationCount);
    } catch (err) {
      console.error('festivalDonationController.list error:', err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getBySlug: async (req, res) => {
    try {
      const rawSlug = req.params.slug || '';
      const slug = String(rawSlug).trim();
      const festival = await festivalDonationModel.findOne({ slug })
        .populate('createdBy', 'name email')
        .populate('eventId');
      if (!festival) {
        return res.status(404).json({ message: "Festival donation page not found" });
      }
  const { donationModel } = require('../models/donation.model');
  const donations = await donationModel.find({ $or: [{ festivalId: festival._id }, { festivalSlug: slug }] })
        .sort({ createdAt: -1 })
        .limit(10);
      res.json({
        ...festival.toObject(),
        event: festival.eventId,
        donations
      });
    } catch (err) {
      console.error('festivalDonationController.getBySlug error:', err);
      res.status(500).json({ message: "Server error" });
    }
  },

  create: async (req, res) => {
    try {
  let { title, slug, description, images, donationOptions, meta } = req.body;
  if (slug) slug = String(slug).trim();
      if (!title || !slug) return res.status(400).json({ message: "Title and slug are required" });
      const exists = await festivalDonationModel.findOne({ slug });
      if (exists) return res.status(409).json({ message: "Slug already exists" });
      const page = await festivalDonationModel.create({
        title, slug, description, images, donationOptions, meta,
        createdBy: req.user.userId
      });
      res.status(201).json({ message: "Festival donation page created", page });
    } catch (err) {
      console.error('festivalDonationController.create error:', err);
      res.status(500).json({ message: "Server error" });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
  if (req.body.slug) req.body.slug = String(req.body.slug).trim();
  const page = await festivalDonationModel.findByIdAndUpdate(id, req.body, { new: true });
      if (!page) return res.status(404).json({ message: "Festival page not found" });
      res.status(200).json({ message: "Festival donation page updated", page });
    } catch (err) {
      console.error('festivalDonationController.update error:', err);
      res.status(500).json({ message: "Server error" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await festivalDonationModel.findByIdAndDelete(id);
      res.status(200).json({ message: "Festival donation page deleted" });
    } catch (err) {
      console.error('festivalDonationController.delete error:', err);
      res.status(500).json({ message: "Server error" });
    }
  }
};

module.exports = { festivalDonationController };
