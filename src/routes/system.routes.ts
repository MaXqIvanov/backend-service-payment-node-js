import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Проверка работоспособности сервера
 *     description: Возвращает текущий статус сервера и временную метку.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Сервер работает корректно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: "2026-06-06T12:00:00.000Z"
 */
router.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', timestamp: new Date() });
});

export default router;
