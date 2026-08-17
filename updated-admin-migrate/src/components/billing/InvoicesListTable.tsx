/** Stripe invoice row shape for sponsorship invoice tables. */
export type StripeInvoiceTableRow = {
  id: string;
  number: string | null;
  status: string | null;
  customer_email: string | null;
  amount_due: number;
  due_date: number | null;
  created: number;
  hosted_invoice_url: string | null;
  catalog_product_ids: string[];
  sponsorship_category: string | null;
  created_by_name: string | null;
  event_id: string | null;
  event_name: string | null;
  leaflet_id: string | null;
  sponsorship_id: string | null;
};
