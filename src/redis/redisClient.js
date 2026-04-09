const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let client;

async function getClient() {
	if (!client) {
		client = redis.createClient({ url: REDIS_URL });
		client.on('error', (err) => console.error('Redis client error', err));
		await client.connect();
	}
	return client;
}

async function enqueueJob(queueName, payload) {
	const c = await getClient();
	const str = JSON.stringify(payload);
	await c.lPush(queueName, str);
	return true;
}

async function popJob(queueName, timeout = 5) {
	const c = await getClient();
	const res = await c.brPop(queueName, timeout);
	if (!res) return null;
	const payload = JSON.parse(res.element);
	return payload;
}

module.exports = { getClient, enqueueJob, popJob };