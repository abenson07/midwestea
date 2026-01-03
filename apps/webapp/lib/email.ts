import { Resend } from 'resend';

/**
 * Email utility functions for sending transactional emails via Resend
 * 
 * This module provides comprehensive email sending capabilities with:
 * - Retry logic with exponential backoff (max 3 retries)
 * - Comprehensive error handling and custom error classes
 * - Rate limiting awareness (Resend free tier: 100 emails/day)
 * - Email validation utilities
 * - Template rendering helpers
 * - Logging utilities for monitoring
 * 
 * @module email
 * 
 * @example
 * ```typescript
 * import { sendEmail, validateEmail } from '@/lib/email';
 * 
 * // Validate email before sending
 * validateEmail('student@example.com', 'to');
 * 
 * // Send email with retry logic
 * const result = await sendEmail({
 *   from: 'noreply@midwestea.com',
 *   to: 'student@example.com',
 *   subject: 'Welcome!',
 *   html: '<h1>Welcome to MidwestEA</h1>',
 * });
 * 
 * if (result.success) {
 *   console.log('Email sent:', result.id);
 * } else {
 *   console.error('Failed to send:', result.error);
 * }
 * ```
 * 
 * @see {@link https://resend.com/docs} Resend API Documentation
 */

// ============================================================================
// TypeScript Types and Interfaces
// ============================================================================

/**
 * Email recipient information
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Email content configuration
 */
export interface EmailContent {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email sending options
 */
export interface SendEmailOptions {
  from: string;
  to: string | string[] | EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
  metadata?: Record<string, string>;
}

/**
 * Email sending result
 */
export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  retries?: number;
}

/**
 * Email template data base interface
 */
export interface EmailTemplateData {
  recipientName?: string;
  recipientEmail: string;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt?: Date;
}

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base error class for email-related errors
 */
export class EmailError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'EmailError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when email validation fails
 */
export class EmailValidationError extends EmailError {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'EmailValidationError';
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends EmailError {
  constructor(
    message: string,
    public readonly rateLimitInfo?: RateLimitInfo
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when network/API request fails
 */
export class NetworkError extends EmailError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'NetworkError';
  }
}

/**
 * Error thrown when email configuration is invalid
 */
export class ConfigurationError extends EmailError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

// ============================================================================
// Email Validation Utilities
// ============================================================================

/**
 * Basic email format validation regex
 * Matches RFC 5322 compliant email addresses
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email address format
 * 
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic length check
  if (email.length > 254) {
    return false;
  }

  // Check format with regex
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate email address and throw error if invalid
 * 
 * @param email - Email address to validate
 * @param fieldName - Name of the field for error messages
 * @throws EmailValidationError if email is invalid
 */
export function validateEmail(
  email: string,
  fieldName: string = 'email'
): void {
  if (!email || typeof email !== 'string') {
    throw new EmailValidationError(
      `${fieldName} is required and must be a string`,
      fieldName
    );
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    throw new EmailValidationError(`${fieldName} cannot be empty`, fieldName);
  }

  if (trimmedEmail.length > 254) {
    throw new EmailValidationError(
      `${fieldName} is too long (max 254 characters)`,
      fieldName
    );
  }

  if (!isValidEmailFormat(trimmedEmail)) {
    throw new EmailValidationError(
      `${fieldName} has invalid format: ${trimmedEmail}`,
      fieldName
    );
  }
}

/**
 * Validate domain part of email address
 * 
 * @param email - Email address to validate domain for
 * @returns True if domain appears valid
 */
export function isValidEmailDomain(email: string): boolean {
  if (!isValidEmailFormat(email)) {
    return false;
  }

  const domain = email.split('@')[1];
  
  // Check domain has at least one dot
  if (!domain.includes('.')) {
    return false;
  }

  // Check domain doesn't start or end with dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.') ||
      domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }

  return true;
}

/**
 * Sanitize email address (trim and lowercase)
 * 
 * @param email - Email address to sanitize
 * @returns Sanitized email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate and sanitize email address
 * 
 * @param email - Email address to validate and sanitize
 * @param fieldName - Name of the field for error messages
 * @returns Sanitized email address
 * @throws EmailValidationError if email is invalid
 */
export function validateAndSanitizeEmail(
  email: string,
  fieldName: string = 'email'
): string {
  validateEmail(email, fieldName);
  return sanitizeEmail(email);
}

// ============================================================================
// Resend Client Initialization
// ============================================================================

// Initialize Resend client
let resendClient: Resend | null = null;

/**
 * Get or create Resend client instance
 * 
 * @returns Resend client instance
 * @throws Error if RESEND_API_KEY is not configured
 */
export function getResendClient(): Resend {
  // Return existing client if already initialized
  if (resendClient) {
    return resendClient;
  }

  // Get API key from environment variables
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not set. Please configure it in your environment variables.'
    );
  }

  // Validate API key format (Resend keys start with 're_')
  if (!apiKey.startsWith('re_')) {
    throw new Error(
      'Invalid RESEND_API_KEY format. Resend API keys should start with "re_".'
    );
  }

  // Initialize Resend client
  resendClient = new Resend(apiKey);

  return resendClient;
}

/**
 * Reset the Resend client (useful for testing or reconfiguration)
 */
export function resetResendClient(): void {
  resendClient = null;
}

// ============================================================================
// Rate Limiting Awareness
// ============================================================================

/**
 * Resend rate limits (as of 2024)
 * Free tier: 100 emails/day
 * Paid tiers: Higher limits (check Resend dashboard)
 */
const RESEND_RATE_LIMITS = {
  FREE_TIER_DAILY: 100,
  FREE_TIER_PER_SECOND: 10,
} as const;

/**
 * Track email sending for rate limit awareness
 * In production, consider using Redis or database for distributed tracking
 */
const emailSendTracker = {
  dailyCount: 0,
  lastResetDate: new Date().toDateString(),
  perSecondCount: 0,
  lastSecondTimestamp: Date.now(),
};

/**
 * Check if we're approaching rate limits
 * 
 * @returns Rate limit information
 */
export function checkRateLimit(): RateLimitInfo {
  const now = new Date();
  const currentDate = now.toDateString();
  const currentTimestamp = Date.now();

  // Reset daily count if it's a new day
  if (emailSendTracker.lastResetDate !== currentDate) {
    emailSendTracker.dailyCount = 0;
    emailSendTracker.lastResetDate = currentDate;
  }

  // Reset per-second count if it's been more than 1 second
  if (currentTimestamp - emailSendTracker.lastSecondTimestamp >= 1000) {
    emailSendTracker.perSecondCount = 0;
    emailSendTracker.lastSecondTimestamp = currentTimestamp;
  }

  // For now, we'll use free tier limits
  // In production, you might want to check Resend API for actual limits
  const dailyLimit = RESEND_RATE_LIMITS.FREE_TIER_DAILY;
  const remaining = Math.max(0, dailyLimit - emailSendTracker.dailyCount);

  return {
    limit: dailyLimit,
    remaining,
  };
}

/**
 * Increment email send counter
 */
function incrementEmailCounter(): void {
  emailSendTracker.dailyCount++;
  emailSendTracker.perSecondCount++;
}

// ============================================================================
// Core Email Sending Function with Retry Logic
// ============================================================================

/**
 * Calculate exponential backoff delay
 * 
 * @param attemptNumber - Current attempt number (0-indexed)
 * @param baseDelayMs - Base delay in milliseconds (default: 1000ms)
 * @returns Delay in milliseconds
 */
function calculateBackoffDelay(attemptNumber: number, baseDelayMs: number = 1000): number {
  return baseDelayMs * Math.pow(2, attemptNumber);
}

/**
 * Sleep for specified milliseconds
 * 
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 * 
 * @param error - Error to check
 * @returns True if error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (error instanceof NetworkError) {
    return true;
  }

  // Rate limit errors are retryable (after delay)
  if (error instanceof RateLimitError) {
    return true;
  }

  // 5xx server errors are retryable
  if (error?.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  // Timeout errors are retryable
  if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNRESET') {
    return true;
  }

  // Resend API errors that are retryable
  if (error?.message?.includes('timeout') || 
      error?.message?.includes('network') ||
      error?.message?.includes('rate limit')) {
    return true;
  }

  return false;
}

/**
 * Send email with retry logic and error handling
 * 
 * @param options - Email sending options
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise resolving to email send result
 * 
 * @example
 * ```typescript
 * const result = await sendEmail({
 *   from: 'noreply@midwestea.com',
 *   to: 'student@example.com',
 *   subject: 'Welcome!',
 *   html: '<h1>Welcome</h1>',
 * });
 * ```
 */
export async function sendEmail(
  options: SendEmailOptions,
  maxRetries: number = 3
): Promise<EmailSendResult> {
  // Validate inputs
  try {
    validateEmail(options.from, 'from');
    
    // Validate 'to' field
    if (Array.isArray(options.to)) {
      options.to.forEach((recipient, index) => {
        if (typeof recipient === 'string') {
          validateEmail(recipient, `to[${index}]`);
        } else {
          validateEmail(recipient.email, `to[${index}].email`);
        }
      });
    } else if (typeof options.to === 'string') {
      validateEmail(options.to, 'to');
    } else {
      validateEmail(options.to.email, 'to.email');
    }

    if (!options.subject || options.subject.trim().length === 0) {
      throw new EmailValidationError('Subject is required', 'subject');
    }

    if (!options.html || options.html.trim().length === 0) {
      throw new EmailValidationError('HTML content is required', 'html');
    }
  } catch (error) {
    if (error instanceof EmailValidationError) {
      return {
        success: false,
        error: error.message,
        retries: 0,
      };
    }
    throw error;
  }

  // Check rate limits
  const rateLimitInfo = checkRateLimit();
  if (rateLimitInfo.remaining <= 0) {
    return {
      success: false,
      error: `Rate limit exceeded. Daily limit: ${rateLimitInfo.limit}`,
      retries: 0,
    };
  }

  // Get Resend client
  let client: Resend;
  try {
    client = getResendClient();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to initialize Resend client',
      retries: 0,
    };
  }

  // Attempt to send email with retries
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Send email via Resend API
      const result = await client.emails.send({
        from: options.from,
        to: Array.isArray(options.to)
          ? options.to.map(r => typeof r === 'string' ? r : r.email)
          : typeof options.to === 'string'
          ? options.to
          : options.to.email,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        tags: options.tags,
        headers: options.metadata,
      });

      // Success - increment counter and log
      incrementEmailCounter();
      
      const emailResult: EmailSendResult = {
        success: true,
        id: result.data?.id,
        retries: attempt,
      };
      
      // Log successful send
      logEmailAttempt({
        to: Array.isArray(options.to)
          ? (typeof options.to[0] === 'string' ? options.to[0] : options.to[0].email)
          : typeof options.to === 'string'
          ? options.to
          : options.to.email,
        subject: options.subject,
        success: true,
        emailId: result.data?.id,
        retries: attempt,
        emailType: options.tags?.find(t => t.name === 'email_type')?.value,
      });

      return emailResult;
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      if (attempt < maxRetries && isRetryableError(error)) {
        // Calculate backoff delay
        const delay = calculateBackoffDelay(attempt);
        
        // Log retry attempt
        console.warn(
          `[Email] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`,
          error.message
        );

        // Wait before retrying
        await sleep(delay);
        continue;
      }

      // Non-retryable error or max retries reached
      break;
    }
  }

  // All retries failed
  const errorMessage = lastError?.message || 'Unknown error occurred';
  
  // Log failure
  logEmailAttempt({
    to: Array.isArray(options.to)
      ? (typeof options.to[0] === 'string' ? options.to[0] : options.to[0].email)
      : typeof options.to === 'string'
      ? options.to
      : options.to.email,
    subject: options.subject,
    success: false,
    error: errorMessage,
    retries: maxRetries,
  });
  
  // Return error result instead of throwing
  // Callers can check result.success and handle errors appropriately
  return {
    success: false,
    error: `Failed to send email after ${maxRetries + 1} attempts: ${errorMessage}`,
    retries: maxRetries,
  };
}

// ============================================================================
// Email Template Rendering Helpers
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS attacks
 * 
 * @param text - Text to escape
 * @returns Escaped HTML string
 * 
 * @example
 * ```typescript
 * const safe = escapeHtml('<script>alert("xss")</script>');
 * // Returns: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
 * ```
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Format currency amount from cents to dollars
 * 
 * @param amountCents - Amount in cents
 * @returns Formatted currency string (e.g., "$1,234.56")
 * 
 * @example
 * ```typescript
 * formatCurrency(123456); // Returns "$1,234.56"
 * ```
 */
export function formatCurrency(amountCents: number): string {
  const dollars = amountCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

/**
 * Format date to readable string
 * 
 * @param date - Date to format (string, Date, or ISO string)
 * @param format - Format style ('short' | 'long' | 'date')
 * @returns Formatted date string
 * 
 * @example
 * ```typescript
 * formatDate('2024-01-15'); // Returns "January 15, 2024"
 * formatDate('2024-01-15', 'short'); // Returns "Jan 15, 2024"
 * ```
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'date' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  if (format === 'date') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Long format (default)
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Render email template with variable substitution
 * 
 * @param template - HTML template string with {{variable}} placeholders
 * @param data - Data object with values to substitute
 * @returns Rendered HTML string
 * 
 * @example
 * ```typescript
 * const html = renderTemplate(
 *   '<h1>Hello {{name}}!</h1>',
 *   { name: 'John' }
 * );
 * // Returns: '<h1>Hello John!</h1>'
 * ```
 */
export function renderTemplate(
  template: string,
  data: Record<string, string | number | undefined | null>
): string {
  let rendered = template;
  
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    const safeValue = value != null ? String(value) : '';
    rendered = rendered.replace(placeholder, escapeHtml(safeValue));
  }
  
  return rendered;
}

/**
 * Create email wrapper HTML with consistent styling
 * 
 * @param content - Main email content HTML
 * @param options - Optional styling and metadata
 * @returns Complete HTML email with wrapper
 * 
 * @example
 * ```typescript
 * const html = createEmailWrapper('<p>Email content</p>', {
 *   backgroundColor: '#f5f5f5',
 *   maxWidth: '600px',
 * });
 * ```
 */
export function createEmailWrapper(
  content: string,
  options: {
    backgroundColor?: string;
    maxWidth?: string;
    fontFamily?: string;
    companyName?: string;
    companyEmail?: string;
  } = {}
): string {
  const {
    backgroundColor = '#f5f5f5',
    maxWidth = '600px',
    fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    companyName = 'MidwestEA',
    companyEmail = 'support@midwestea.com',
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: ${fontFamily};">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: ${maxWidth}; background-color: #ffffff; border-collapse: collapse; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666666; text-align: center;">
              <p style="margin: 0 0 5px 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              <p style="margin: 0;">
                <a href="mailto:${companyEmail}" style="color: #666666; text-decoration: none;">${companyEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================================================
// Email Logging Utilities
// ============================================================================

/**
 * Email log entry interface
 */
export interface EmailLogEntry {
  to: string;
  subject: string;
  success: boolean;
  emailId?: string;
  error?: string;
  retries?: number;
  timestamp?: Date;
  emailType?: string;
  metadata?: Record<string, string>;
}

/**
 * Log email sending attempt
 * 
 * This function logs email attempts for monitoring and debugging.
 * In production, you may want to store these in a database or logging service.
 * 
 * @param entry - Email log entry data
 * 
 * @example
 * ```typescript
 * logEmailAttempt({
 *   to: 'student@example.com',
 *   subject: 'Welcome!',
 *   success: true,
 *   emailId: 'resend_123',
 *   emailType: 'enrollment_confirmation',
 * });
 * ```
 */
export function logEmailAttempt(entry: EmailLogEntry): void {
  const timestamp = entry.timestamp || new Date();
  const logData = {
    timestamp: timestamp.toISOString(),
    to: entry.to,
    subject: entry.subject,
    success: entry.success,
    emailId: entry.emailId,
    error: entry.error,
    retries: entry.retries || 0,
    emailType: entry.emailType,
    metadata: entry.metadata,
  };

  if (entry.success) {
    console.log('[Email] ✅ Sent successfully:', {
      to: entry.to,
      subject: entry.subject,
      emailId: entry.emailId,
      retries: entry.retries,
      emailType: entry.emailType,
    });
  } else {
    console.error('[Email] ❌ Failed to send:', {
      to: entry.to,
      subject: entry.subject,
      error: entry.error,
      retries: entry.retries,
      emailType: entry.emailType,
    });
  }

  // TODO: In production, store logs in database or logging service
  // Example: await insertEmailLog(logData);
}

/**
 * Log email sending result (called from sendEmail function)
 * 
 * @param result - Email send result
 * @param options - Original email options
 * @param emailType - Type of email being sent (for categorization)
 */
export function logEmailResult(
  result: EmailSendResult,
  options: SendEmailOptions,
  emailType?: string
): void {
  const toEmail = Array.isArray(options.to)
    ? (typeof options.to[0] === 'string' ? options.to[0] : options.to[0].email)
    : typeof options.to === 'string'
    ? options.to
    : options.to.email;

  logEmailAttempt({
    to: toEmail,
    subject: options.subject,
    success: result.success,
    emailId: result.id,
    error: result.error,
    retries: result.retries,
    emailType,
  });
}

