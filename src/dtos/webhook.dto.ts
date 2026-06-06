/**
 * @openapi
 * components:
 *   parameters:
 *     XSignatureHeader:
 *       name: X-Signature
 *       in: header
 *       required: true
 *       description: HMAC-SHA256 подпись, сгенерированная от тела запроса (JSON-строки) с использованием секретного ключа мерчанта
 *       schema:
 *         type: string
 *       example: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
 *
 *     XTimestampHeader:
 *       name: X-Timestamp
 *       in: header
 *       required: true
 *       description: Текущее Unix-время отправки запроса в миллисекундах
 *       schema:
 *         type: integer
 *       example: 1780757834000
 *
 *     XNonceHeader:
 *       name: X-Nonce
 *       in: header
 *       required: true
 *       description: Уникальная одноразовая случайная строка (строго для одного запроса)
 *       schema:
 *         type: string
 *       example: d41d8cd98f00b204e9800998ecf8427e
 *
 *   schemas:
 *     WebhookBodyDto:
 *       type: object
 *       required:
 *         - invoiceId
 *         - status
 *       properties:
 *         invoiceId:
 *           type: string
 *           example: "60d5ec49f833af3d54a35029"
 *         status:
 *           type: string
 *           enum: [paid, failed]
 *           example: "paid"
 *
 *     WebhookResponseDto:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           example: "Invoice successfully updated to paid"
 *
 *     WebhookErrorResponseDto:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           example: "Duplicate request (Nonce already used)"
 */

export interface WebhookBodyDto {
	invoiceId: string;
	status: 'paid' | 'failed';
}

export interface WebhookResponseDto {
	message: string;
}

export interface WebhookErrorResponseDto {
	error: string;
}
