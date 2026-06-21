/**
 * Formats a phone number string to (XXX) XXX-XXXX format
 * @param value - The input value (can contain digits, spaces, dashes, parentheses)
 * @returns Formatted phone number string
 */
export function formatPhone(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);
  
  // Format based on length
  if (limitedDigits.length === 0) {
    return '';
  } else if (limitedDigits.length <= 3) {
    return `(${limitedDigits}`;
  } else if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
}

/**
 * Handles phone input change event and formats the value
 * @param e - React change event
 * @param setValue - State setter function
 */
export function handlePhoneChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (value: string) => void
): void {
  const formatted = formatPhone(e.target.value);
  setValue(formatted);
}










