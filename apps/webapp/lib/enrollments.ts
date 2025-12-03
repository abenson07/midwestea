import { createSupabaseAdminClient } from '@midwestea/utils';
import { getStripeClient } from './stripe';
import Stripe from 'stripe';
import type { Student, Class, Enrollment, Payment } from '@midwestea/types';

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
 */
export async function createPayment(
  enrollmentId: string,
  paymentIntent: Stripe.PaymentIntent,
  amountCents: number
): Promise<Payment> {
  const supabase = createSupabaseAdminClient();

  // Get receipt URL from charges if available
  let receiptUrl: string | null = null;
  if (paymentIntent.charges?.data && paymentIntent.charges.data.length > 0) {
    receiptUrl = paymentIntent.charges.data[0].receipt_url || null;
  }

  const { data: payment, error: insertError } = await supabase
    .from('payments')
    .insert({
      enrollment_id: enrollmentId,
      amount_cents: amountCents,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_receipt_url: receiptUrl,
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create payment: ${insertError.message}`);
  }

  if (!payment) {
    throw new Error('Failed to create payment: no data returned');
  }

  return payment as Payment;
}

