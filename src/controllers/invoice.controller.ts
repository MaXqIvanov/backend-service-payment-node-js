import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceResponseDto, PaginatedInvoicesResponseDto } from '../dtos/invoice.dto';
import { WebhookErrorResponseDto, WebhookResponseDto } from '../dtos/webhook.dto';

export class InvoiceController {
	/**
	 * POST /invoice — Создание счета
	 */
	static async createInvoice(req: Request, res: Response): Promise<void> {
		try {
			const { merchantId, amount, currency } = req.body;

			if (!merchantId || !amount || !currency) {
				const errResponse: WebhookErrorResponseDto = {
					error: 'Missing required fields: merchantId, amount, or currency'
				};
				res.status(400).json(errResponse);
				return;
			}

			const invoice = await InvoiceService.create(merchantId, String(amount), currency);

			const responseData: InvoiceResponseDto = {
				invoiceId: invoice._id.toString(),
				merchantId: invoice.merchantId,
				amount: invoice.amount.toString(),
				fee: invoice.fee.toString(),
				amountToReceive: invoice.amountToReceive.toString(),
				currency: invoice.currency,
				status: invoice.status,
				createdAt: invoice.createdAt
			};

			res.status(201).json(responseData);
		} catch (error: any) {
			const errResponse: WebhookErrorResponseDto = {
				error: 'Internal server error'
			};
			res.status(500).json(errResponse);
		}
	}

	/**
	 * POST /webhook — Прием вебхука платежной системы
	 */
	static async processWebhook(req: Request, res: Response): Promise<void> {
		try {
			const { invoiceId, status } = req.body;

			if (!invoiceId || !status) {
				const errResponse: WebhookErrorResponseDto = { error: 'Missing required fields: invoiceId or status' };
				res.status(400).json(errResponse);
				return;
			}

			if (status !== 'paid' && status !== 'failed') {
				const errResponse: WebhookErrorResponseDto = { error: "Invalid status. Allowed values: 'paid' or 'failed'" };
				res.status(400).json(errResponse);
				return;
			}

			const result = await InvoiceService.handleWebhook(invoiceId, status);

			if (!result.success) {
				const errResponse: WebhookErrorResponseDto = { error: result.message };
				res.status(404).json(errResponse);
				return;
			}

			const successResponse: WebhookResponseDto = { message: result.message };
			res.status(200).json(successResponse);
		} catch (error: any) {
			console.error('[InvoiceController.processWebhook]:', error);
			const errResponse: WebhookErrorResponseDto = { error: 'Internal server error' };
			res.status(500).json(errResponse);
		}
	}

	/**
	 * GET /invoice/:id — Получение статуса счета
	 */
	static async getInvoice(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			if (!id || typeof id !== 'string') {
				const errResponse: WebhookErrorResponseDto = {
					error: 'Missing or invalid invoice ID in path parameters'
				};
				res.status(400).json(errResponse);
				return;
			}

			const invoice = await InvoiceService.getById(id);
			if (!invoice) {
				const errResponse: WebhookErrorResponseDto = {
					error: 'Invoice not found'
				};
				res.status(404).json(errResponse);
				return;
			}

			const responseData: InvoiceResponseDto = {
				invoiceId: invoice._id.toString(),
				merchantId: invoice.merchantId,
				amount: invoice.amount.toString(),
				fee: invoice.fee.toString(),
				amountToReceive: invoice.amountToReceive.toString(),
				currency: invoice.currency,
				status: invoice.status,
				createdAt: invoice.createdAt
			};

			res.status(200).json(responseData);
		} catch (error: any) {
			console.error('[InvoiceController.getInvoice]:', error);
			const errResponse: WebhookErrorResponseDto = {
				error: 'Internal server error'
			};
			res.status(500).json(errResponse);
		}
	}

	/**
	 * GET /invoice — Получение списка всех счетов
	 */
	static async getAllInvoices(req: Request, res: Response): Promise<void> {
		try {
			const queryMerchantId = req.query.merchantId;
			const filter: { merchantId?: string } = {};

			if (typeof queryMerchantId === 'string') {
				filter.merchantId = queryMerchantId;
			}

			const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
			const rawLimit = parseInt(String(req.query.limit), 10) || 10;
			const limit = Math.min(100, Math.max(1, rawLimit));

			const { total, invoices } = await InvoiceService.getAll(filter, page, limit);

			const formattedInvoices: InvoiceResponseDto[] = invoices.map((invoice) => ({
				invoiceId: invoice._id.toString(),
				merchantId: invoice.merchantId,
				amount: invoice.amount.toString(),
				fee: invoice.fee.toString(),
				amountToReceive: invoice.amountToReceive.toString(),
				currency: invoice.currency,
				status: invoice.status,
				createdAt: invoice.createdAt
			}));

			const jsonResponse: PaginatedInvoicesResponseDto = {
				data: formattedInvoices,
				meta: { total, page, limit }
			};

			res.status(200).json(jsonResponse);
		} catch (error: any) {
			const errResponse: WebhookErrorResponseDto = {
				error: 'Internal server error'
			};
			res.status(500).json(errResponse);
		}
	}
}
