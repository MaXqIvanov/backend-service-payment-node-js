import mongoose, { Schema, Document, Types } from 'mongoose';
import { INVOICE_STATUS, InvoiceStatus } from '../constants';

export interface IInvoice extends Document {
	merchantId: string;
	amount: Types.Decimal128;
	currency: string;
	fee: Types.Decimal128;
	amountToReceive: Types.Decimal128;
	status: InvoiceStatus;
	createdAt: Date;
	updatedAt: Date;
}

const invoiceSchema = new Schema(
	{
		merchantId: { type: String, required: true },
		amount: { type: Schema.Types.Decimal128, required: true },
		currency: { type: String, required: true },
		fee: { type: Schema.Types.Decimal128, required: true },
		amountToReceive: { type: Schema.Types.Decimal128, required: true },
		status: {
			type: String,
			enum: Object.values(INVOICE_STATUS),
			default: INVOICE_STATUS.PENDING
		}
	},
	{ timestamps: true }
);

invoiceSchema.index({ merchantId: 1, createdAt: -1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
