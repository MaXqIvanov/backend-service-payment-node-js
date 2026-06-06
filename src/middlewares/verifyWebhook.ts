import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { redisClient } from '../config/redis';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const TIMESTAMP_WINDOW_MS = 15 * 60 * 1000;

export const verifyWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		if (!WEBHOOK_SECRET) {
			console.error('[CRITICAL]: WEBHOOK_SECRET is not defined in environment variables.');
			res.status(500).json({ error: 'Server misconfiguration: security key is missing' });
			return;
		}

		const signature = req.header('X-Signature');
		const timestampStr = req.header('X-Timestamp');
		const nonce = req.header('X-Nonce');

		if (!signature || !timestampStr || !nonce) {
			res.status(400).json({ error: 'Missing security headers: X-Signature, X-Timestamp, or X-Nonce' });
			return;
		}

		const timestamp = parseInt(timestampStr, 10);
		const now = Date.now();

		if (isNaN(timestamp) || Math.abs(now - timestamp) > TIMESTAMP_WINDOW_MS) {
			res.status(400).json({ error: 'Request timestamp is out of acceptable window' });
			return;
		}

		const nonceKey = `nonce:${nonce}`;
		const isNonceUsed = await redisClient.get(nonceKey);

		if (isNonceUsed) {
			res.status(400).json({ error: 'Duplicate request (Nonce already used)' });
			return;
		}

		const rawBody = JSON.stringify(req.body);
		const computedSignature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');

		if (signature !== computedSignature) {
			res.status(401).json({ error: 'Invalid signature' });
			return;
		}
		const ttlSeconds = Math.ceil(TIMESTAMP_WINDOW_MS / 1000);
		await redisClient.setEx(nonceKey, ttlSeconds, '1');

		next();
	} catch (error) {
		console.error('[verifyWebhook Middleware Error]:', error);
		res.status(500).json({ error: 'Internal webhook verification error' });
	}
};
