const { popJob } = require('../src/redis/redisClient');
const { donationModel } = require('../src/models/donation.model');

const QUEUE = 'payments:jobs';

async function processJob(job) {
  try {
    if (!job || !job.event) return;
    switch (job.event) {
      case 'payment.captured': {
        const payment = job.payload && job.payload.payment && job.payload.payment.entity;
        if (!payment) break;
        const orderId = payment.order_id;
        if (!orderId) break;
        const existingDonation = await donationModel.findOne({ razorpayOrderId: orderId });
        if (existingDonation) {
          if (existingDonation.status !== 'paid' && existingDonation.status !== 'completed') {
            await donationModel.findOneAndUpdate({ razorpayOrderId: orderId }, { status: 'paid', razorpayPaymentId: payment.id });
            console.log('Worker: Donation marked paid for order', orderId);
          } else {
            console.log('Worker: Donation already marked paid for order', orderId);
          }
        } else {
          console.warn('Worker: Donation not found for order:', orderId);
        }
        break;
      }
      default:
        console.log('Worker: Unhandled job event', job.event);
    }
  } catch (err) {
    console.error('Worker: job processing error', err && err.stack ? err.stack : err);
  }
}

async function run() {
  console.log('Payment worker started, listening to', QUEUE);
  while (true) {
    try {
      const job = await popJob(QUEUE, 5);
      if (!job) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      await processJob(job);
    } catch (err) {
      console.error('Worker loop error', err && err.stack ? err.stack : err);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

run().catch(err => {
  console.error('Worker failed', err && err.stack ? err.stack : err);
  process.exit(1);
});
