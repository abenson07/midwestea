import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@midwestea/utils';
import {
  getOrCreateCustomer,
  getOrCreateItem,
  findOrCreateCategory,
  findOrCreateSubcategory,
  createInvoice,
  getInvoicePaymentUrl,
} from '@/lib/quickbooks';

/**
 * Create a QuickBooks invoice for checkout
 * 
 * POST /api/checkout/create-invoice
 * Body: { email: string, classId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, classId } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Fetch class data from database
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('class_id', classId)
      .maybeSingle();

    if (classError) {
      console.error('Error fetching class:', classError);
      return NextResponse.json(
        { error: 'Database error while fetching class' },
        { status: 500 }
      );
    }

    if (!classData) {
      return NextResponse.json(
        { error: `Class with ID "${classId}" not found` },
        { status: 404 }
      );
    }

    // Determine amount and SKU based on registration fee
    const hasRegistrationFee = !!(classData.registration_fee && classData.registration_fee > 0);
    const amount = hasRegistrationFee 
      ? (classData.registration_fee as number)
      : (classData.price as number || 0);
    
    const skuName = hasRegistrationFee ? 'registration fee' : 'tuition';

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Class has no valid price or registration fee' },
        { status: 400 }
      );
    }

    // Get or create QuickBooks customer
    let customer;
    try {
      customer = await getOrCreateCustomer(email);
    } catch (error: any) {
      console.error('Error with QuickBooks customer:', error);
      return NextResponse.json(
        { error: `Failed to get or create customer: ${error.message}` },
        { status: 500 }
      );
    }

    if (!customer.Id) {
      return NextResponse.json(
        { error: 'Customer created but missing ID' },
        { status: 500 }
      );
    }

    // Get or create the appropriate item (SKU)
    let item;
    try {
      item = await getOrCreateItem(skuName);
    } catch (error: any) {
      console.error('Error with QuickBooks item:', error);
      return NextResponse.json(
        { error: `Failed to get or create item: ${error.message}` },
        { status: 500 }
      );
    }

    if (!item.Id) {
      return NextResponse.json(
        { error: `Item "${skuName}" created but missing ID` },
        { status: 500 }
      );
    }

    // Get or create category (course_code)
    const courseCode = classData.course_code as string | null;
    let category = null;
    if (courseCode) {
      try {
        category = await findOrCreateCategory(courseCode);
      } catch (error: any) {
        console.warn('Error creating category:', error);
        // Continue without category if it fails
      }
    }

    // Get or create subcategory (class_id)
    let subcategory = null;
    try {
      subcategory = await findOrCreateSubcategory(classId, category?.Id);
    } catch (error: any) {
      console.warn('Error creating subcategory:', error);
      // Continue without subcategory if it fails
    }

    // Create invoice description
    const description = hasRegistrationFee
      ? `Registration Fee - ${classData.class_name || classId}`
      : `Tuition - ${classData.class_name || classId}`;

    // Create invoice with custom fields to store class_id for webhook processing
    const customFields = [
      { Name: 'ClassID', StringValue: classId },
      { Name: 'PaymentType', StringValue: skuName },
    ];

    // Create the invoice
    let invoice;
    try {
      invoice = await createInvoice(
        customer.Id,
        item.Id,
        amount,
        description,
        category?.Id,
        subcategory?.Id,
        customFields
      );
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      return NextResponse.json(
        { error: `Failed to create invoice: ${error.message}` },
        { status: 500 }
      );
    }

    if (!invoice.Id) {
      return NextResponse.json(
        { error: 'Invoice created but missing ID' },
        { status: 500 }
      );
    }

    // Get payment URL
    const companyId = process.env.QUICKBOOKS_COMPANY_ID || '9341455971522574';
    const useSandbox = process.env.QUICKBOOKS_USE_SANDBOX !== 'false';
    
    let paymentUrl: string;
    try {
      paymentUrl = getInvoicePaymentUrl(invoice, companyId, useSandbox);
    } catch (error: any) {
      console.error('Error getting payment URL:', error);
      return NextResponse.json(
        { error: `Failed to get payment URL: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoiceId: invoice.Id,
      paymentUrl,
      invoice,
    });
  } catch (error: any) {
    console.error('Error in create-invoice API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

