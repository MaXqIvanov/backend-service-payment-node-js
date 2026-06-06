import Big from 'big.js';
import { Types } from 'mongoose';
import { Invoice, IInvoice } from '../models/Invoice';
import { INVOICE_STATUS } from '../constants';

const MERCHANT_SETTINGS_DB: Record<string, { feePercent: number }> = {
	merchant_123: { feePercent: 2.5 },
	merchant_777: { feePercent: 1.0 }
};

export class InvoiceService {
	/**
	 * Создание счета с точным расчетом комиссии
	 */
	static async create(merchantId: string, amountStr: string, currency: string): Promise<IInvoice> {
		const merchantSettings = MERCHANT_SETTINGS_DB[merchantId] || { feePercent: 1.0 };

		const amount = new Big(amountStr);
		const feePercent = new Big(merchantSettings.feePercent).div(100);

		const fee = amount.times(feePercent).round(2, Big.roundHalfUp);

		const amountToReceive = amount.minus(fee);

		return await Invoice.create({
			merchantId,
			currency,
			amount: Types.Decimal128.fromString(amount.toFixed(2)),
			fee: Types.Decimal128.fromString(fee.toFixed(2)),
			amountToReceive: Types.Decimal128.fromString(amountToReceive.toFixed(2)),
			status: INVOICE_STATUS.PENDING
		});
	}

	static async handleWebhook(
		invoiceId: string,
		status: 'paid' | 'failed'
	): Promise<{ success: boolean; message: string }> {
		const targetStatus = status === 'paid' ? INVOICE_STATUS.PAID : INVOICE_STATUS.FAILED;

		const updatedInvoice = await Invoice.findOneAndUpdate(
			{ _id: invoiceId, status: INVOICE_STATUS.PENDING },
			{ $set: { status: targetStatus } },
			{ returnDocument: 'after' }
		);

		if (!updatedInvoice) {
			const existingInvoice = await Invoice.findById(invoiceId);
			if (!existingInvoice) {
				return { success: false, message: 'Invoice not found' };
			}

			return { success: true, message: `Invoice already processed. Current status: ${existingInvoice.status}` };
		}

		return { success: true, message: `Invoice successfully updated to ${targetStatus}` };
	}

	static async getById(id: string): Promise<IInvoice | null> {
		return await Invoice.findById(id);
	}

	/**
	 * Получение списка счетов с фильтрацией и пагинацией
	 */
	static async getAll(filter: { merchantId?: string }, page: number, limit: number) {
		const query: Record<string, any> = {};

		if (filter.merchantId) {
			query.merchantId = filter.merchantId;
		}

		const skip = (page - 1) * limit;

		const [total, invoices] = await Promise.all([
			Invoice.countDocuments(query),
			Invoice.find(query).sort({ merchantId: 1, createdAt: -1 }).skip(skip).limit(limit)
		]);

		return { total, invoices };
	}
}
