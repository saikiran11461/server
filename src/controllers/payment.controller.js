const Razorpay = require('razorpay');
const crypto = require('crypto');
const { donationModel } = require('../models/donation.model');
const { enqueueJob } = require('../redis/redisClient');

const createRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  try {
    console.log('createRazorpayInstance: RAZORPAY_KEY_ID=', key_id ? `${key_id.slice(0, 6)}...` : 'not-set');
  } catch (e) {}
  return new Razorpay({ key_id, key_secret });
};

const paymentController = {
  createOrder: async (req, res) => {
    try {
      const { name, email, mobile, amount, certificate, panNumber, mahaprasadam, prasadamAddress } = req.body;

      if (!amount || Number(amount) < 1) {
        return res.status(400).send('Invalid amount');
      }

      const instance = createRazorpayInstance();
      if (!instance) return res.status(500).json({ message: 'Razorpay keys not configured on server' });

      const options = {
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
      };

      const order = await instance.orders.create(options);

      let resolvedFestivalId = req.body.festivalId;
      if (!resolvedFestivalId && req.body.festivalSlug) {
        try {
          const { festivalDonationModel } = require('../models/festivalDonation.model');
          const fest = await festivalDonationModel.findOne({ slug: req.body.festivalSlug }).select('_id');
          if (fest) resolvedFestivalId = fest._id;
        } catch (err) {
          console.warn('Could not resolve festivalSlug to festivalId', req.body.festivalSlug, err);
        }
      }

      const donation = await donationModel.create({
        donorName: name || req.body.donorName || 'Anonymous',
        donorEmail: email || req.body.donorEmail,
        donorMobile: mobile || req.body.donorMobile,
        amount,
        panNumber: panNumber || req.body.panNumber,
        certificate: certificate || req.body.certificate,
        wantPrasadam: mahaprasadam || req.body.wantPrasadam,
        prasadamAddress: prasadamAddress || req.body.prasadamAddress,
        festivalSlug: req.body.festivalSlug || undefined,
        festivalId: resolvedFestivalId,
        razorpayOrderId: order.id,
        status: 'pending'
      });

      return res.status(200).json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID, donationId: donation._id });
    } catch (err) {
      try {
        const serialized = JSON.stringify(err, Object.getOwnPropertyNames(err));
        console.error('createOrder error', serialized);
      } catch (e) {
        console.error('createOrder error', err && err.stack ? err.stack : err);
      }
  let errStr = '';
  try { errStr = JSON.stringify(err, Object.getOwnPropertyNames(err)); } catch (e) { errStr = String(err); }
  const razorpayStatus = err && err.statusCode ? err.statusCode : undefined;
  const razorpayBody = err && err.error ? err.error : undefined;
  return res.status(500).json({ message: 'Failed to create order', error: err && err.message ? err.message : errStr, razorpayStatus, razorpayBody });
    }
  },

  webhook: async (req, res) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];
      if (!webhookSecret) {
        console.warn('Webhook secret not configured; rejecting');
        return res.status(500).send('Webhook secret not configured');
      }
      if (!signature) return res.status(400).send('Signature missing');

      const body = (req.body && req.body.toString) ? req.body.toString() : JSON.stringify(req.body || {});
      const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
      if (expected !== signature) {
        console.warn('Invalid webhook signature');
        console.log('Received signature:', signature);
        console.log('Generated signature:', expected);
        return res.status(400).send('Invalid signature');
      }

      const event = JSON.parse(body);
      console.log('Webhook Event:', event.event);

      try {
        await enqueueJob('payments:jobs', { event: event.event, payload: event.payload, receivedAt: Date.now() });
        return res.status(200).send('Webhook enqueued');
      } catch (enqueueErr) {
        console.warn('Failed to enqueue webhook job, falling back to inline processing', enqueueErr && enqueueErr.message ? enqueueErr.message : enqueueErr);
      }

      switch (event.event) {
        case 'payment.captured': {
          const payment = event.payload && event.payload.payment && event.payload.payment.entity;
          if (!payment) break;
          const orderId = payment.order_id;
          const existingDonation = await donationModel.findOne({ razorpayOrderId: orderId });
          if (existingDonation) {
            await donationModel.findOneAndUpdate({ razorpayOrderId: orderId, status: { $ne: 'paid' } }, { status: 'paid', razorpayPaymentId: payment.id });
            console.log('Donation marked paid for order', orderId);
          } else {
            console.warn('Donation not found for order:', orderId);
          }
          break;
        }
        default:
          console.log('Unhandled event:', event.event);
      }

      return res.status(200).send('Webhook processed');
    } catch (error) {
      console.error('webhook error', error && error.stack ? error.stack : error);
      return res.status(500).send('Webhook error');
    }
  },
};

module.exports = { paymentController };
