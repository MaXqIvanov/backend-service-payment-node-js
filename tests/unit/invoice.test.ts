import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import app from '../../src/app';
import { redisClient, connectRedis } from '../../src/config/redis';
import { connectDatabase } from '../../src/config/database';
import { Invoice } from '../../src/models/Invoice';

const TEST_SECRET = process.env.WEBHOOK_SECRET as string;

describe('Payment Service Integration Tests', () => {
	beforeAll(async () => {
		await connectDatabase();
		await connectRedis();
	});

	afterAll(async () => {
		if (mongoose.connection.db) {
			await mongoose.connection.db.dropDatabase();
		}
		await mongoose.disconnect();
		if (redisClient.isOpen) {
			await redisClient.quit();
		}
	});

	beforeEach(async () => {
		await Invoice.deleteMany({});
		if (redisClient.isOpen) {
			await redisClient.flushAll();
		}
	});

	describe('POST /invoice — Создание счета', () => {
		it('Должен успешно рассчитать комиссию 2.5% для merchant_123', async () => {
			const res = await request(app).post('/invoice').send({
				merchantId: 'merchant_123',
				amount: '1000.00',
				currency: 'USD'
			});

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty('invoiceId');
			expect(res.body.amount).toBe('1000.00');
			expect(res.body.fee).toBe('25.00');
			expect(res.body.amountToReceive).toBe('975.00');
			expect(res.body.status).toBe('pending');
		});

		it('Должен вернуть 400 при отсутствии обязательных полей', async () => {
			const res = await request(app).post('/invoice').send({
				merchantId: 'merchant_123'
			});

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('error');
		});
	});

	describe('POST /webhook — Прием статуса оплаты', () => {
		let invoiceId: string;

		beforeEach(async () => {
			const invoice = await request(app)
				.post('/invoice')
				.send({ merchantId: 'merchant_123', amount: '100.00', currency: 'EUR' });
			invoiceId = invoice.body.invoiceId;
		});

		it('Должен успешно обработать валидный вебхук с правильной подписью', async () => {
			const body = { invoiceId, status: 'paid' };
			const rawBody = JSON.stringify(body);
			const timestamp = Date.now().toString();
			const nonce = crypto.randomBytes(16).toString('hex');

			const signature = crypto.createHmac('sha256', TEST_SECRET).update(rawBody).digest('hex');

			const res = await request(app)
				.post('/webhook')
				.set('X-Signature', signature)
				.set('X-Timestamp', timestamp)
				.set('X-Nonce', nonce)
				.send(body);

			expect(res.status).toBe(200);
			expect(res.body.message).toContain('successfully updated to paid');

			const checkRes = await request(app).get(`/invoice/${invoiceId}`);
			expect(checkRes.body.status).toBe('paid');
		});

		it('Должен вернуть 401, если подпись невалидна (тело запроса подменено)', async () => {
			const body = { invoiceId, status: 'paid' };
			const timestamp = Date.now().toString();
			const nonce = crypto.randomBytes(16).toString('hex');
			const fakeSignature = 'wrong_calculated_hmac_signature';

			const res = await request(app)
				.post('/webhook')
				.set('X-Signature', fakeSignature)
				.set('X-Timestamp', timestamp)
				.set('X-Nonce', nonce)
				.send(body);

			expect(res.status).toBe(401);
			expect(res.body.error).toBe('Invalid signature');
		});

		it('Защита от Replay-атак: должен вернуть 400, если X-Timestamp устарел', async () => {
			const body = { invoiceId, status: 'paid' };
			const rawBody = JSON.stringify(body);

			const oldTimestamp = (Date.now() - 20 * 60 * 1000).toString();
			const nonce = crypto.randomBytes(16).toString('hex');

			const signature = crypto.createHmac('sha256', TEST_SECRET).update(rawBody).digest('hex');

			const res = await request(app)
				.post('/webhook')
				.set('X-Signature', signature)
				.set('X-Timestamp', oldTimestamp)
				.set('X-Nonce', nonce)
				.send(body);

			expect(res.status).toBe(400);
			expect(res.body.error).toContain('acceptable window');
		});

		it('Идемпотентность: повторный запрос с тем же Nonce должен отклоняться Redis', async () => {
			const body = { invoiceId, status: 'paid' };
			const rawBody = JSON.stringify(body);
			const timestamp = Date.now().toString();
			const nonce = 'identical_nonce_123';

			const signature = crypto.createHmac('sha256', TEST_SECRET).update(rawBody).digest('hex');

			const res1 = await request(app)
				.post('/webhook')
				.set('X-Signature', signature)
				.set('X-Timestamp', timestamp)
				.set('X-Nonce', nonce)
				.send(body);
			expect(res1.status).toBe(200);

			const res2 = await request(app)
				.post('/webhook')
				.set('X-Signature', signature)
				.set('X-Timestamp', timestamp)
				.set('X-Nonce', nonce)
				.send(body);

			expect(res2.status).toBe(400);
			expect(res2.body.error).toContain('Nonce already used');
		});
	});
});
