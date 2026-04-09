const express = require("express");
const { festivalDonationController } = require("../controllers/festivalDonation.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

const festivalDonationRouter = express.Router();

	festivalDonationRouter.get("/all", festivalDonationController.publicList);
	festivalDonationRouter.get("/:slug", festivalDonationController.getBySlug);

	festivalDonationRouter.post('/debug/trim-slugs', async (req, res) => {
		try {
			const { festivalDonationModel } = require('../models/festivalDonation.model');
			const list = await festivalDonationModel.find();
			for (const f of list) {
				const trimmed = String(f.slug || '').trim();
				if (trimmed !== f.slug) {
					f.slug = trimmed;
					await f.save();
				}
			}
			res.json({ message: 'Trimmed slugs' });
		} catch (err) {
			res.status(500).json({ message: 'Server error', error: String(err) });
		}
	});

festivalDonationRouter.get("/", authMiddleware, adminMiddleware, festivalDonationController.list);
festivalDonationRouter.post("/", authMiddleware, adminMiddleware, festivalDonationController.create);
festivalDonationRouter.put("/:id", authMiddleware, adminMiddleware, festivalDonationController.update);
festivalDonationRouter.delete("/:id", authMiddleware, adminMiddleware, festivalDonationController.delete);

module.exports = { festivalDonationRouter };
