import { createSupabaseAdminClient } from '@midwestea/utils';
import { formatCurrency } from '@midwestea/utils';
import { getStripeClient } from './stripe';
import Stripe from 'stripe';
import type { Student, Class, Enrollment, Payment } from '@midwestea/types';
import { formatDate } from './email';

/**
 * Find or create a student by email
 * Returns the student record, creating auth user and student record if needed
 */
export async function findOrCreateStudent(
  email: string
): Promise<Student> {
  const supabase = createSupabaseAdminClient();

  // First, check if auth user exists by email
  // Note: Supabase admin API doesn't support filtering by email directly,
  // so we list users and filter. For production with large user bases,
  // consider creating a database function to query auth.users directly.
  // We'll try to find the user, and if not found, create a new one.
  let existingAuthUser = null;
  
  try {
    // List users and search for matching email
    // In production, you may want to implement pagination or use a database function
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      // If listing fails, we'll try to create the user anyway
      console.warn('Failed to list auth users, will attempt to create new user:', authError.message);
    } else {
      existingAuthUser = authUsers.users.find((user) => user.email === email);
    }
  } catch (error: any) {
    // If there's an error listing users, log it but continue to try creating
    console.warn('Error listing auth users, will attempt to create new user:', error.message);
  }

  let authUserId: string;

  if (existingAuthUser) {
    // Auth user exists, use their ID
    authUserId = existingAuthUser.id;
  } else {
    // Create new auth user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirm email for checkout flow
    });

    if (createError) {
      throw new Error(`Failed to create auth user: ${createError.message}`);
    }

    if (!newUser.user) {
      throw new Error('Failed to create auth user: no user returned');
    }

    authUserId = newUser.user.id;
  }

  // Now check if student record exists
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('id', authUserId)
    .single();

  if (studentError && studentError.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected if student doesn't exist
    throw new Error(`Failed to query student: ${studentError.message}`);
  }

  if (student) {
    return student as Student;
  }

  // Student record doesn't exist, create it with the same UUID as auth user
  const { data: newStudent, error: insertError } = await supabase
    .from('students')
    .insert({
      id: authUserId,
      first_name: null,
      last_name: null,
      full_name: null,
      phone: null,
      stripe_customer_id: null,
      has_required_info: false,
      t_shirt_size: null,
      vaccination_card_url: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create student record: ${insertError.message}`);
  }

  if (!newStudent) {
    throw new Error('Failed to create student record: no data returned');
  }

  return newStudent as Student;
}

/**
 * Get or create Stripe customer for a student
 * Updates student record with customer ID if it was missing
 */
export async function getOrCreateStripeCustomer(
  student: Student,
  email: string,
  paymentIntent?: Stripe.PaymentIntent
): Promise<string> {
  // If student already has a customer ID, return it
  if (student.stripe_customer_id) {
    return student.stripe_customer_id;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  const stripe = getStripeClient(stripeSecretKey);
  let customerId: string;

  // Check if payment intent has a customer
  if (paymentIntent?.customer && typeof paymentIntent.customer === 'string') {
    customerId = paymentIntent.customer;
  } else if (paymentIntent?.customer && typeof paymentIntent.customer === 'object') {
    customerId = paymentIntent.customer.id;
  } else {
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        student_id: student.id,
      },
    });
    customerId = customer.id;
  }

  // Update student record with customer ID
  const supabase = createSupabaseAdminClient();
  const { error: updateError } = await supabase
    .from('students')
    .update({ stripe_customer_id: customerId })
    .eq('id', student.id);

  if (updateError) {
    console.error('Failed to update student with customer ID:', updateError);
    // Don't throw - customer ID is set in Stripe, we can continue
  }

  return customerId;
}

/**
 * Find a class by class_id (text field, not UUID)
 */
export async function findClassByClassId(classId: string): Promise<Class> {
  const supabase = createSupabaseAdminClient();

  const { data: classRecord, error } = await supabase
    .from('classes')
    .select('*')
    .eq('class_id', classId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error(`Class not found with class_id: ${classId}`);
    }
    throw new Error(`Failed to query class: ${error.message}`);
  }

  if (!classRecord) {
    throw new Error(`Class not found with class_id: ${classId}`);
  }

  return classRecord as Class;
}

/**
 * Create an enrollment record
 * Checks for existing enrollment to prevent duplicates
 */
export async function createEnrollment(
  studentId: string,
  classId: string
): Promise<Enrollment> {
  const supabase = createSupabaseAdminClient();

  // Check if enrollment already exists
  const { data: existing, error: checkError } = await supabase
    .from('enrollments')
    .select('*')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .single();

  if (existing) {
    // Enrollment already exists, return it
    return existing as Enrollment;
  }

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 is "not found" which is expected if enrollment doesn't exist
    throw new Error(`Failed to check existing enrollment: ${checkError.message}`);
  }

  // Create new enrollment
  const { data: enrollment, error: insertError } = await supabase
    .from('enrollments')
    .insert({
      student_id: studentId,
      class_id: classId,
      enrollment_status: 'registered',
      onboarding_complete: false,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create enrollment: ${insertError.message}`);
  }

  if (!enrollment) {
    throw new Error('Failed to create enrollment: no data returned');
  }

  return enrollment as Enrollment;
}

/**
 * Create a payment record
 * @deprecated This function is deprecated. Use createTransaction() instead.
 * NOTE: Now uses transactions table instead of payments table
 */
export async function createPayment(
  enrollmentId: string,
  paymentIntent: Stripe.PaymentIntent,
  amountCents: number
): Promise<Payment> {
  const supabase = createSupabaseAdminClient();

  // Fetch enrollment to get student_id and class_id
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('student_id, class_id')
    .eq('id', enrollmentId)
    .single();

  if (enrollmentError || !enrollment) {
    throw new Error(`Failed to fetch enrollment: ${enrollmentError?.message || 'Enrollment not found'}`);
  }

  // Get receipt URL from latest charge if available
  let receiptUrl: string | null = null;
  if (paymentIntent.latest_charge) {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (stripeSecretKey) {
        const stripe = getStripeClient(stripeSecretKey);
        const chargeId = typeof paymentIntent.latest_charge === 'string' 
          ? paymentIntent.latest_charge 
          : paymentIntent.latest_charge.id;
        
        const charge = await stripe.charges.retrieve(chargeId);
        receiptUrl = charge.receipt_url || null;
      }
    } catch (error) {
      // If we can't retrieve the charge, receipt URL will remain null
      console.warn('Failed to retrieve charge for receipt URL:', error);
    }
  }

  // Create transaction instead of payment
  // Default to 'registration_fee' transaction type since this is legacy code
  const now = new Date().toISOString();
  const { data: transaction, error: insertError } = await supabase
    .from('transactions')
    .insert({
      enrollment_id: enrollmentId,
      student_id: enrollment.student_id,
      class_id: enrollment.class_id,
      class_type: 'course', // Default, legacy code doesn't have this info
      transaction_type: 'registration_fee',
      quantity: 1,
      stripe_payment_intent_id: paymentIntent.id,
      transaction_status: 'paid',
      payment_date: now,
      due_date: now,
      amount_due: amountCents,
      amount_paid: amountCents,
      invoice_number: null, // Legacy code doesn't set invoice number
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create transaction: ${insertError.message}`);
  }

  if (!transaction) {
    throw new Error('Failed to create transaction: no data returned');
  }

  // Map transaction back to Payment type for compatibility
  return {
    id: transaction.id,
    enrollment_id: transaction.enrollment_id,
    amount_cents: transaction.amount_paid || transaction.amount_due || 0,
    stripe_payment_intent_id: transaction.stripe_payment_intent_id,
    stripe_receipt_url: receiptUrl,
    payment_status: transaction.transaction_status || 'paid',
    paid_at: transaction.payment_date,
    created_at: transaction.created_at,
    updated_at: transaction.updated_at,
  } as Payment;
}

/**
 * Fetch class with course relationship to determine class type
 * Returns class with course information
 * Uses course_code to look up the course type (not course_uuid)
 */
export async function findClassWithCourse(classId: string): Promise<{
  class: Class;
  courseType: 'course' | 'program' | null;
  classStartDate: string | null;
  registrationFee: number | null;
  price: number | null;
}> {
  const supabase = createSupabaseAdminClient();

  // Fetch class by class_id (text field) - get course_code to look up course
  // Also fetch registration_fee and price for amount calculations
  const { data: classRecord, error: classError } = await supabase
    .from('classes')
    .select('id, class_id, course_code, class_start_date, registration_fee, price')
    .eq('class_id', classId)
    .maybeSingle();

  if (classError) {
    console.error('[findClassWithCourse] Database error:', classError);
    throw new Error(`Failed to query class: ${classError.message}`);
  }

  if (!classRecord) {
    throw new Error(`Class not found with class_id: ${classId}. Please verify the class exists in the database.`);
  }

  // Validate that class has required course_code
  if (!classRecord.course_code) {
    throw new Error(`Class ${classId} does not have a course_code set. This is required to determine class type.`);
  }

  // Fetch course by course_code to determine type
  let courseType: 'course' | 'program' | null = null;
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('type')
    .eq('course_code', classRecord.course_code)
    .maybeSingle();

  if (courseError) {
    console.warn('[findClassWithCourse] Failed to fetch course:', courseError.message);
    // Don't throw - we'll default to 'course' if we can't determine
  } else if (course) {
    // Map course type to class type
    // Assuming 'program' in courses.type means program, otherwise course
    courseType = (course as any).type === 'program' ? 'program' : 'course';
  }

  return {
    class: classRecord as Class,
    courseType,
    classStartDate: (classRecord as any).class_start_date || null,
    registrationFee: (classRecord as any).registration_fee || null,
    price: (classRecord as any).price || null,
  };
}

/**
 * Determine if a class is a course or program
 */
export async function getClassType(classId: string): Promise<'course' | 'program'> {
  const { courseType } = await findClassWithCourse(classId);
  
  // Default to 'course' if we can't determine
  return courseType || 'course';
}

/**
 * Get the next invoice number from the transactions table
 * Returns the highest invoice_number + 1, or 1 if no transactions exist
 */
export async function getNextTransactionInvoiceNumber(): Promise<number> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('invoice_number')
    .order('invoice_number', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" which is fine if table is empty
    throw new Error(`Failed to get next invoice number: ${error.message}`);
  }

  if (data && data.invoice_number) {
    return data.invoice_number + 1;
  }

  // Start at 1 if no transactions exist
  return 1;
}

/**
 * Create a transaction record
 */
export async function createTransaction(data: {
  enrollmentId: string;
  studentId: string;
  classId: string;
  classType: 'course' | 'program';
  transactionType: 'registration_fee' | 'tuition_a' | 'tuition_b';
  quantity: number;
  stripePaymentIntentId: string | null;
  transactionStatus: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentDate: string | null;
  dueDate: string | null;
  amountDue: number | null;
  amountPaid: number | null;
  invoiceNumber?: number | null;
}): Promise<any> {
  const supabase = createSupabaseAdminClient();

  const { data: transaction, error: insertError } = await supabase
    .from('transactions')
    .insert({
      enrollment_id: data.enrollmentId,
      student_id: data.studentId,
      class_id: data.classId,
      class_type: data.classType,
      transaction_type: data.transactionType,
      quantity: data.quantity,
      stripe_payment_intent_id: data.stripePaymentIntentId,
      quickbooks_invoice_link: null,
      quickbooks_receipt_link: null,
      transaction_status: data.transactionStatus,
      payment_date: data.paymentDate,
      due_date: data.dueDate,
      amount_due: data.amountDue,
      amount_paid: data.amountPaid,
      invoice_number: data.invoiceNumber ?? null,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create transaction: ${insertError.message}`);
  }

  if (!transaction) {
    throw new Error('Failed to create transaction: no data returned');
  }

  return transaction;
}

/**
 * Check if a payment intent has already been processed
 */
export async function isPaymentIntentProcessed(paymentIntentId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .limit(1);

  if (error) {
    // If table doesn't exist or other error, assume not processed
    console.warn('Error checking for existing transaction:', error.message);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Update student's full_name if it differs from the provided full name
 */
export async function updateStudentNameIfNeeded(
  studentId: string,
  fullName: string
): Promise<void> {
  const supabase = createSupabaseAdminClient();

  // Check current name
  const { data: student, error: fetchError } = await supabase
    .from('students')
    .select('full_name')
    .eq('id', studentId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch student: ${fetchError.message}`);
  }

  // Update if name is different (store in full_name field)
  if (student && (student as any).full_name !== fullName) {
    const { error: updateError } = await supabase
      .from('students')
      .update({ full_name: fullName })
      .eq('id', studentId);

    if (updateError) {
      throw new Error(`Failed to update student name: ${updateError.message}`);
    }
  }
}

/**
 * Update student's Stripe customer ID
 */
export async function updateStudentStripeCustomerId(
  studentId: string,
  stripeCustomerId: string
): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error: updateError } = await supabase
    .from('students')
    .update({ stripe_customer_id: stripeCustomerId })
    .eq('id', studentId);

  if (updateError) {
    throw new Error(`Failed to update student stripe_customer_id: ${updateError.message}`);
  }
}

/**
 * Get enrollment by student_id and class_id
 * Returns enrollment with class details
 */
export async function getEnrollmentByStudentAndClass(
  studentId: string,
  classId: string
): Promise<{ enrollment: Enrollment | null; error: string | null }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { enrollment: null, error: null }; // Not found, but not an error
      }
      return { enrollment: null, error: error.message };
    }

    return { enrollment: data as Enrollment, error: null };
  } catch (err: any) {
    return { enrollment: null, error: err.message || 'Failed to fetch enrollment' };
  }
}

// ============================================================================
// Outstanding Invoices - Type Definitions
// ============================================================================

/**
 * Outstanding invoice data structure
 * Represents a pending transaction that needs to be paid
 */
export interface OutstandingInvoice {
  invoiceNumber: number | null;
  transactionType: 'registration_fee' | 'tuition_a' | 'tuition_b';
  quantity: number;
  amountDue: number; // Amount in cents
  dueDate: string | Date;
  totalAmount: number; // Calculated: quantity * amount_due (in cents)
}

/**
 * Invoice calculation result
 * Contains summary information about outstanding invoices
 */
export interface InvoiceCalculation {
  invoices: OutstandingInvoice[];
  totalOutstanding: number; // Total amount in cents
  count: number;
}

// ============================================================================
// Outstanding Invoices - Query Cache
// ============================================================================

/**
 * Simple in-memory cache for outstanding invoices queries
 * Cache key: enrollmentId
 * Cache value: { data: OutstandingInvoice[], timestamp: number }
 */
const outstandingInvoicesCache = new Map<
  string,
  { data: OutstandingInvoice[]; timestamp: number }
>();

/**
 * Cache TTL in milliseconds (5 minutes)
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Clear cache entry for a specific enrollment
 * Call this when invoice data changes (e.g., payment received)
 */
export function clearOutstandingInvoicesCache(enrollmentId: string): void {
  outstandingInvoicesCache.delete(enrollmentId);
}

/**
 * Clear all outstanding invoices cache
 */
export function clearAllOutstandingInvoicesCache(): void {
  outstandingInvoicesCache.clear();
}

// ============================================================================
// Outstanding Invoices - Helper Functions
// ============================================================================

/**
 * Calculate total outstanding amount from invoices
 * 
 * @param invoices - Array of outstanding invoices
 * @returns Total amount in cents
 */
export function calculateTotalOutstanding(invoices: OutstandingInvoice[]): number {
  return invoices.reduce((total, invoice) => {
    return total + invoice.totalAmount;
  }, 0);
}

/**
 * Format due date to readable string
 * 
 * @param date - Date to format (string, Date, or ISO string)
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export function formatDueDate(date: string | Date): string {
  return formatDate(date, 'date');
}

// ============================================================================
// Outstanding Invoices - Database Query Function
// ============================================================================

/**
 * Get outstanding invoices for a specific enrollment
 * 
 * Retrieves all pending transactions (invoices) for an enrollment,
 * ordered by due date ascending. Results are cached for 5 minutes.
 * 
 * @param enrollmentId - UUID of the enrollment
 * @returns Array of outstanding invoices, or empty array if none found
 * @throws Error if database query fails
 * 
 * @example
 * ```typescript
 * const invoices = await getOutstandingInvoices('enrollment-uuid');
 * const total = calculateTotalOutstanding(invoices);
 * console.log(`Total outstanding: ${formatCurrency(total)}`);
 * ```
 */
export async function getOutstandingInvoices(
  enrollmentId: string
): Promise<OutstandingInvoice[]> {
  const startTime = Date.now();
  const logContext = {
    enrollmentId,
    function: 'getOutstandingInvoices',
  };

  // Validate input
  if (!enrollmentId || typeof enrollmentId !== 'string') {
    const error = new Error('Invalid enrollmentId: must be a non-empty string');
    console.error('[getOutstandingInvoices] Validation error:', {
      ...logContext,
      error: error.message,
    });
    throw error;
  }

  // Check cache first
  const cached = outstandingInvoicesCache.get(enrollmentId);
  if (cached) {
    const cacheAge = Date.now() - cached.timestamp;
    if (cacheAge < CACHE_TTL_MS) {
      const queryTime = Date.now() - startTime;
      console.log('[getOutstandingInvoices] Cache hit:', {
        ...logContext,
        cacheAge: `${cacheAge}ms`,
        queryTime: `${queryTime}ms`,
        invoiceCount: cached.data.length,
      });
      return cached.data;
    } else {
      // Cache expired, remove it
      outstandingInvoicesCache.delete(enrollmentId);
      console.log('[getOutstandingInvoices] Cache expired:', {
        ...logContext,
        cacheAge: `${cacheAge}ms`,
      });
    }
  }

  const supabase = createSupabaseAdminClient();

  try {
    // Query transactions table for pending invoices
    // Note: Supabase uses .eq() instead of SQL WHERE, and .order() instead of ORDER BY
    const { data: transactions, error, status } = await supabase
      .from('transactions')
      .select('invoice_number, transaction_type, quantity, amount_due, due_date')
      .eq('enrollment_id', enrollmentId)
      .eq('transaction_status', 'pending')
      .order('due_date', { ascending: true });

    const queryTime = Date.now() - startTime;

    if (error) {
      // Log error with context
      console.error('[getOutstandingInvoices] Database query error:', {
        ...logContext,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        queryTime: `${queryTime}ms`,
        httpStatus: status,
      });

      // Handle specific error types
      if (error.code === 'PGRST116') {
        // Not found - return empty array (no outstanding invoices)
        console.log('[getOutstandingInvoices] No outstanding invoices found:', {
          ...logContext,
          queryTime: `${queryTime}ms`,
        });
        return [];
      }

      // For other errors, throw
      throw new Error(
        `Failed to query outstanding invoices: ${error.message}${error.hint ? ` (${error.hint})` : ''}`
      );
    }

    // Transform database results to OutstandingInvoice format
    const invoices: OutstandingInvoice[] = (transactions || []).map((tx) => {
      const quantity = tx.quantity || 0;
      const amountDue = tx.amount_due || 0;
      const totalAmount = quantity * amountDue;

      return {
        invoiceNumber: tx.invoice_number,
        transactionType: tx.transaction_type as 'registration_fee' | 'tuition_a' | 'tuition_b',
        quantity,
        amountDue,
        dueDate: tx.due_date || new Date().toISOString(),
        totalAmount,
      };
    });

    // Cache the results
    outstandingInvoicesCache.set(enrollmentId, {
      data: invoices,
      timestamp: Date.now(),
    });

    // Log success
    console.log('[getOutstandingInvoices] Query successful:', {
      ...logContext,
      queryTime: `${queryTime}ms`,
      invoiceCount: invoices.length,
      totalOutstanding: calculateTotalOutstanding(invoices),
      cacheHit: false,
    });

    return invoices;
  } catch (err: any) {
    const queryTime = Date.now() - startTime;

    // Log unexpected errors
    console.error('[getOutstandingInvoices] Unexpected error:', {
      ...logContext,
      error: err.message,
      errorStack: err.stack,
      queryTime: `${queryTime}ms`,
    });

    // Re-throw with context
    throw new Error(
      `Failed to get outstanding invoices for enrollment ${enrollmentId}: ${err.message}`
    );
  }
}

/**
 * Get outstanding invoices with calculation summary
 * 
 * Convenience function that returns both the invoices and calculated totals
 * 
 * @param enrollmentId - UUID of the enrollment
 * @returns Invoice calculation result with invoices and totals
 * @throws Error if database query fails
 * 
 * @example
 * ```typescript
 * const result = await getOutstandingInvoicesWithCalculation('enrollment-uuid');
 * console.log(`Found ${result.count} invoices totaling ${formatCurrency(result.totalOutstanding)}`);
 * ```
 */
export async function getOutstandingInvoicesWithCalculation(
  enrollmentId: string
): Promise<InvoiceCalculation> {
  const invoices = await getOutstandingInvoices(enrollmentId);
  const totalOutstanding = calculateTotalOutstanding(invoices);

  return {
    invoices,
    totalOutstanding,
    count: invoices.length,
  };
}

