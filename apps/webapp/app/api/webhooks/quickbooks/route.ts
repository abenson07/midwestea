import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import {
  findOrCreateStudent,
  findClassByClassId,
  createEnrollment,
} from '@/lib/enrollments';
import {
  getInvoice,
  getOrCreateCustomer,
  createSubsequentInvoices,
  query,
} from '@/lib/quickbooks';
import { insertLog } from '@/lib/logging';

export const runtime = 'nodejs';

/**
 * QuickBooks Webhook Handler
 * 
 * Handles payment notifications from QuickBooks Online
 * 
 * Note: QuickBooks webhook structure may vary. This implementation assumes
 * webhook payload contains invoice payment information.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[webhook] Received QuickBooks webhook:', JSON.stringify(body, null, 2));

    // QuickBooks webhook structure varies, but typically includes:
    // - eventNotifications array with event objects
    // - Each event has eventType and dataChangeEvent
    // - dataChangeEvent contains entities array with changed entities

    // Verify webhook signature if QuickBooks provides one
    // Note: QuickBooks may use different signature verification methods
    const signature = request.headers.get('intuit-signature');
    if (signature) {
      // TODO: Implement signature verification if QuickBooks provides webhook secret
      // For now, we'll process the webhook without verification in sandbox
      console.log('[webhook] Received signature (verification not yet implemented)');
    }

    // Extract event notifications from webhook payload
    const eventNotifications = body.eventNotifications || body.EventNotifications || [];
    
    if (eventNotifications.length === 0) {
      console.log('[webhook] No event notifications in webhook payload');
      return NextResponse.json({ received: true, message: 'No events to process' });
    }

    // Process each event notification
    for (const eventNotification of eventNotifications) {
      const dataChangeEvent = eventNotification.dataChangeEvent || eventNotification.DataChangeEvent;
      
      if (!dataChangeEvent) {
        console.log('[webhook] No dataChangeEvent in notification');
        continue;
      }

      const entities = dataChangeEvent.entities || dataChangeEvent.Entities || [];
      
      // Process each entity change
      for (const entity of entities) {
        const entityType = entity.name || entity.Name;
        const operation = entity.operation || entity.Operation;
        const id = entity.id || entity.Id;

        console.log(`[webhook] Processing entity: ${entityType}, operation: ${operation}, id: ${id}`);

        // Handle Payment events (invoice paid)
        if (entityType === 'Payment' && operation === 'Create') {
          try {
            await handlePaymentEvent(id, entity);
          } catch (error: any) {
            console.error(`[webhook] Error processing Payment event ${id}:`, error);
            // Continue processing other events even if one fails
          }
        }
      }
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (error: any) {
    console.error('[webhook] Error processing QuickBooks webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle a Payment event from QuickBooks
 */
async function handlePaymentEvent(paymentId: string, paymentEntity: any) {
  console.log(`[webhook] Processing payment: ${paymentId}`);

  // Get the payment details from QuickBooks
  // Note: We may need to query the Payment entity to get full details
  // For now, we'll try to extract invoice reference from the entity
  
  // The payment entity should reference an invoice
  // We need to get the invoice to find the customer and class_id
  
  // Query the payment to get invoice reference
  // Note: QuickBooks API structure may require us to query the payment
  // For webhook processing, we'll need to get the invoice ID from the payment
  
  // Since webhook payload structure varies, we'll try to extract invoice reference
  // from the entity or query it from QuickBooks API
  let invoiceId: string | undefined;
  
  if (paymentEntity.LinkedTxn) {
    const linkedTxn = Array.isArray(paymentEntity.LinkedTxn) 
      ? paymentEntity.LinkedTxn[0] 
      : paymentEntity.LinkedTxn;
    invoiceId = linkedTxn?.TxnId || linkedTxn?.txnId;
  }

  if (!invoiceId) {
    console.error('[webhook] Could not extract invoice ID from payment entity');
    throw new Error('Invoice ID not found in payment entity');
  }

  console.log(`[webhook] Payment references invoice: ${invoiceId}`);

  // Get the invoice from QuickBooks to extract customer and class_id
  const invoice = await getInvoice(invoiceId);

  if (!invoice.CustomerRef?.value) {
    throw new Error('Invoice missing customer reference');
  }

  // Get customer ID from invoice
  const customerId = invoice.CustomerRef.value;
  
  // Extract class_id from invoice custom fields
  let classId: string | undefined;
  if (invoice.CustomField && Array.isArray(invoice.CustomField)) {
    const classIdField = invoice.CustomField.find(
      (field: any) => field.Name === 'ClassID' || field.name === 'ClassID'
    );
    if (classIdField) {
      classId = classIdField.StringValue;
    }
  }

  // Query customer by ID to get email
  const customerQuery = `SELECT * FROM Customer WHERE Id = '${customerId}'`;
  const customers = await query(customerQuery);
  
  if (customers.length === 0) {
    throw new Error(`Customer ${customerId} not found`);
  }

  const customerData = customers[0] as any;
  const customerEmail = customerData.PrimaryEmailAddr?.Address || customerData.primaryEmailAddr?.address;

  if (!customerEmail) {
    throw new Error(`Customer ${customerId} has no email address`);
  }

  if (!classId) {
    throw new Error('Class ID not found in invoice custom fields');
  }

  console.log(`[webhook] Extracted email: ${customerEmail}, classId: ${classId}`);

  // Find or create student
  const student = await findOrCreateStudent(customerEmail);
  console.log(`[webhook] Student found/created: ${student.id}`);

  // Find class by class_id
  const classRecord = await findClassByClassId(classId);
  console.log(`[webhook] Class found: ${classRecord.id}, class_id: ${classRecord.class_id}`);

  // Create enrollment
  const enrollment = await createEnrollment(student.id, classRecord.id);
  console.log(`[webhook] Enrollment created/found: ${enrollment.id}`);

  // Log student registration
  try {
    await insertLog({
      admin_user_id: null,
      reference_id: classRecord.id,
      reference_type: 'class',
      action_type: 'student_registered',
      student_id: student.id,
      class_id: classRecord.id,
    });
  } catch (logError: any) {
    console.error('[webhook] Failed to log student registration:', logError);
  }

  // Log payment success
  try {
    const invoiceAmount = invoice.Line?.reduce((sum: number, line: any) => {
      return sum + (line.Amount || line.amount || 0);
    }, 0) || 0;
    const amountCents = Math.round(invoiceAmount * 100);

    await insertLog({
      admin_user_id: null,
      reference_id: classRecord.id,
      reference_type: 'class',
      action_type: 'payment_success',
      student_id: student.id,
      class_id: classRecord.id,
      amount: amountCents,
    });
  } catch (logError: any) {
    console.error('[webhook] Failed to log payment success:', logError);
  }

  // If class has registration fee, create subsequent invoices
  const hasRegistrationFee = !!(classRecord.registration_fee && classRecord.registration_fee > 0);
  
  if (hasRegistrationFee && classRecord.price) {
    console.log('[webhook] Class has registration fee, creating subsequent invoices');
    
    try {
      // Get invoice due dates from class, or calculate from class_start_date
      let invoice1DueDate = (classRecord as any)['invoice_1_due_date'];
      let invoice2DueDate = (classRecord as any)['invoice_2_due_date'];
      
      // Calculate dates from class_start_date if not set and class_start_date exists
      if ((!invoice1DueDate || !invoice2DueDate) && classRecord.class_start_date) {
        try {
          const startDate = new Date(classRecord.class_start_date);
          
          // Invoice 1: due 3 weeks (21 days) before class_start_date
          const calculatedDate1 = new Date(startDate);
          calculatedDate1.setDate(calculatedDate1.getDate() - 21);
          
          // Invoice 2: due 1 week (7 days) after class_start_date
          const calculatedDate2 = new Date(startDate);
          calculatedDate2.setDate(calculatedDate2.getDate() + 7);
          
          // Format dates as YYYY-MM-DD strings
          const formatDateString = (date: Date): string => {
            return date.toISOString().split('T')[0];
          };
          
          invoice1DueDate = invoice1DueDate || formatDateString(calculatedDate1);
          invoice2DueDate = invoice2DueDate || formatDateString(calculatedDate2);
        } catch (error) {
          console.error('[webhook] Error calculating invoice dates from class_start_date:', error);
        }
      }
      
      const subsequentInvoices = await createSubsequentInvoices(
        customerId,
        classRecord.price,
        classId,
        classRecord.course_code || '',
        invoice1DueDate,
        invoice2DueDate
      );
      
      console.log(`[webhook] Created ${subsequentInvoices.length} subsequent invoices`);
    } catch (invoiceError: any) {
      console.error('[webhook] Failed to create subsequent invoices:', invoiceError);
      // Don't fail the webhook if subsequent invoice creation fails
    }
  }

  return {
    success: true,
    student_id: student.id,
    enrollment_id: enrollment.id,
    class_id: classRecord.id,
  };
}

