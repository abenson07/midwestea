/**
 * Formats a price in cents to a US currency string with commas for thousands
 * @param cents - The price in cents (e.g., 165000 for $1,650.00)
 * @returns Formatted currency string (e.g., "$1,650.00")
 */
export function formatCurrency(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return "—";
  }
  
  const dollars = cents / 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}






