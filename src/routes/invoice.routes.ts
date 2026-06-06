import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';

const router = Router();

/**
 * @openapi
 * /invoice:
 *   post:
 *     summary: Создание нового счета на оплату
 *     tags:
 *       - Invoices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvoiceDto'
 *     responses:
 *       201:
 *         description: Счет успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvoiceResponseDto'
 *       400:
 *         description: Отсутствуют обязательные поля
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: merchantId, amount, or currency"
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post('/', InvoiceController.createInvoice);

/**
 * @openapi
 * /invoice/{id}:
 *   get:
 *     summary: Получить текущий статус счета
 *     tags:
 *       - Invoices
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Уникальный идентификатор счета
 *         schema:
 *           type: string
 *         example: 60d5ec49f833af3d54a35029
 *     responses:
 *       200:
 *         description: Данные счета успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvoiceResponseDto'
 *       404:
 *         description: Счет не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invoice not found"
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/:id', InvoiceController.getInvoice);

/**
 * @openapi
 * /invoice:
 *   get:
 *     summary: Получить список всех счетов
 *     tags:
 *       - Invoices
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantIdQuery'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Список счетов успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvoiceResponseDto'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/', InvoiceController.getAllInvoices);

export default router;
