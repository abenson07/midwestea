-- Track discount provenance on transactions, so the admin UI can show
-- "XX% discount applied to original $XX" wherever amount_due is displayed.
-- Both nullable; NULL means "amount_due has never been adjusted via the
-- admin Apply Discount / Set Amount actions" (or an old row predating this).
--
-- discount_percent is only set by the percentage-based "Apply Discount"
-- action; "Set Amount" (a direct dollar figure) leaves it NULL and relies on
-- original_amount_due alone to compute/display a dollar-amount discount.
--
-- original_amount_due captures the pre-adjustment amount_due each time either
-- admin action runs, so it always reflects the most recent adjustment, not
-- necessarily the very first ever value on this row.
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS discount_percent NUMERIC;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS original_amount_due INTEGER;
