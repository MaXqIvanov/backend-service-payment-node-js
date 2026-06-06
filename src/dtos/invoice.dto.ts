/**
 * @openapi
 * components:
 *   parameters:
 *     MerchantIdQuery:
 *       name: merchantId
 *       in: query
 *       required: false
 *       description: Идентификатор мерчанта для фильтрации
 *       schema:
 *         type: string
 *       example: merchant_123
 *
 *     PageQuery:
 *       name: page
 *       in: query
 *       required: false
 *       description: Номер страницы для пагинации
 *       schema:
 *         type: integer
 *         default: 1
 *
 *     LimitQuery:
 *       name: limit
 *       in: query
 *       required: false
 *       description: Количество элементов на странице
 *       schema:
 *         type: integer
 *         default: 10
 *
 *   schemas:
 *     InvoiceResponseDto:
 *       type: object
 *       required:
 *         - invoiceId
 *         - merchantId
 *         - amount
 *         - fee
 *         - amountToReceive
 *         - currency
 *         - status
 *         - createdAt
 *       properties:
 *         invoiceId:
 *           type: string
 *           example: "60d5ec49f833af3d54a35029"
 *           description: Уникальный идентификатор счета (MongoDB ObjectId)
 *         merchantId:
 *           type: string
 *           example: "merchant_123"
 *         amount:
 *           type: string
 *           example: "1000.00"
 *           description: Сумма счета строкой для сохранения точности Decimal
 *         fee:
 *           type: string
 *           example: "25.00"
 *           description: Рассчитанная комиссия шлюза
 *         amountToReceive:
 *           type: string
 *           example: "975.00"
 *           description: Сумма к зачислению мерчанту за вычетом комиссии
 *         currency:
 *           type: string
 *           example: "USD"
 *         status:
 *           type: string
 *           enum: [pending, paid, failed]
 *           example: "pending"
 *         createdAt:
 *           type: string
 *           example: "2026-06-06T12:00:00.000Z"
 *
 *     CreateInvoiceDto:
 *       type: object
 *       required:
 *         - merchantId
 *         - amount
 *         - currency
 *       properties:
 *         merchantId:
 *           type: string
 *           example: "merchant_123"
 *           description: Уникальный идентификатор мерчанта
 *         amount:
 *           type: string
 *           example: "1000.00"
 *           description: Сумма счета
 *         currency:
 *           type: string
 *           example: "USD"
 *           description: Трехбуквенный код валюты
 *
 *     PaginatedInvoicesResponseDto:
 *       type: object
 *       required:
 *         - data
 *         - meta
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceResponseDto'
 *         meta:
 *           type: object
 *           required:
 *             - total
 *             - page
 *             - limit
 *           properties:
 *             total:
 *               type: integer
 *               example: 150
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 */

export interface InvoiceResponseDto {
	invoiceId: string;
	merchantId: string;
	amount: string;
	fee: string;
	amountToReceive: string;
	currency: string;
	status: string;
	createdAt: Date | string;
}

export interface CreateInvoiceDto {
	merchantId: string;
	amount: string;
	currency: string;
}

export interface PaginatedInvoicesResponseDto {
	data: InvoiceResponseDto[];
	meta: {
		total: number;
		page: number;
		limit: number;
	};
}
