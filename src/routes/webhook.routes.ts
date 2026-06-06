import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { verifyWebhook } from '../middlewares/verifyWebhook';

const router = Router();

/**
 * @openapi
 * /webhook:
 *   post:
 *     summary: Прием статуса оплаты от платежной системы
 *     tags:
 *       - Webhooks
 *     parameters:
 *       - $ref: '#/components/parameters/XSignatureHeader'
 *       - $ref: '#/components/parameters/XTimestampHeader'
 *       - $ref: '#/components/parameters/XNonceHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookBodyDto'
 *     responses:
 *       200:
 *         description: Вебхук успешно обработан (или уже был обработан ранее)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookResponseDto'
 *       400:
 *         description: Ошибка валидации полей или заголовков (устаревший timestamp, повторный nonce)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookErrorResponseDto'
 *       401:
 *         description: Неверная подпись X-Signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookErrorResponseDto'
 *       404:
 *         description: Указанный счет не найден в базе данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookErrorResponseDto'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post('/', verifyWebhook, InvoiceController.processWebhook);

export default router;
