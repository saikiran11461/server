const express = require('express');
const { paymentController } = require('../controllers/payment.controller');

const paymentRouter = express.Router();

paymentRouter.post('/order', express.json(), paymentController.createOrder);

paymentRouter.post('/webhook', express.raw({ type: '*/*' }), paymentController.webhook);

paymentRouter.get('/debug/all', async (req, res) => {
	try {
		const { donationModel } = require('../models/donation.model');
		const docs = await donationModel.find().sort({ createdAt: -1 }).limit(20).lean();
		return res.json({ donations: docs });
	} catch (err) {
		return res.status(500).json({ message: 'Server error', error: String(err) });
	}
});

paymentRouter.get('/debug/:orderId', async (req, res) => {
	try {
		const { donationModel } = require('../models/donation.model');
		const d = await donationModel.findOne({ razorpayOrderId: req.params.orderId });
		if (!d) return res.status(404).json({ message: 'Donation not found' });
		return res.json({ donation: d });
	} catch (err) {
		return res.status(500).json({ message: 'Server error', error: String(err) });
	}
});

paymentRouter.post('/debug/normalize-donations', async (req, res) => {
	try {
		const { donationModel } = require('../models/donation.model');
		const { festivalDonationModel } = require('../models/festivalDonation.model');
		const all = await donationModel.find({ festivalSlug: { $exists: true, $ne: null } });
		for (const d of all) {
			const trimmed = String(d.festivalSlug || '').trim();
			let resolvedFestivalId = d.festivalId;
			if (!resolvedFestivalId && trimmed) {
				const fest = await festivalDonationModel.findOne({ slug: trimmed }).select('_id');
				if (fest) resolvedFestivalId = fest._id;
			}
			d.festivalSlug = trimmed || d.festivalSlug;
			if (resolvedFestivalId) d.festivalId = resolvedFestivalId;
			await d.save();
		}
		return res.json({ message: 'Normalized donations', count: all.length });
	} catch (err) {
		return res.status(500).json({ message: 'Server error', error: String(err) });
	}
});

module.exports = { paymentRouter };
