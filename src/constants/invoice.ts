export const INVOICE_STATUS = {
	PENDING: 'pending',
	PAID: 'paid',
	FAILED: 'failed'
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];
