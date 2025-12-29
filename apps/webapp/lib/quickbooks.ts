/**
 * QuickBooks Online API Client
 * 
 * Handles OAuth token management, API requests, and QuickBooks entity operations
 */

const QB_SANDBOX_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
const QB_PRODUCTION_BASE_URL = 'https://quickbooks.api.intuit.com/v3/company';

interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  companyId: string;
  accessToken?: string;
  refreshToken?: string;
  realmId?: string;
  useSandbox?: boolean;
}

interface QuickBooksCustomer {
  Id?: string;
  SyncToken?: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  GivenName?: string;
  FamilyName?: string;
  DisplayName?: string;
}

interface QuickBooksItem {
  Id?: string;
  Name: string;
  Type?: string;
  IncomeAccountRef?: {
    value: string;
    name: string;
  };
}

export interface QuickBooksInvoice {
  Id?: string;
  SyncToken?: string;
  DocNumber?: string;
  CustomerRef: {
    value: string;
    name?: string;
  };
  Line: Array<{
    DetailType: string;
    Amount: number;
    SalesItemLineDetail?: {
      ItemRef: {
        value: string;
        name?: string;
      };
      Qty?: number;
      UnitPrice?: number;
    };
    Description?: string;
  }>;
  CustomField?: Array<{
    DefinitionId: string;
    StringValue?: string;
    Name: string;
  }>;
  PrivateNote?: string;
  InvoiceLink?: string;
  PaymentLink?: string;
  AllowOnlinePayment?: boolean;
  AllowOnlineCreditCardPayment?: boolean;
  AllowOnlineACHPayment?: boolean;
}

interface QuickBooksQueryResponse<T> {
  QueryResponse: {
    maxResults: number;
    startPosition: number;
    [entityName: string]: T[] | number;
  };
  time: string;
}

interface QuickBooksError {
  Fault: {
    type: string;
    Error: Array<{
      Detail: string;
      code: string;
      Message: string;
    }>;
  };
  time: string;
}

/**
 * Get QuickBooks configuration from environment variables
 */
function getQuickBooksConfig(): QuickBooksConfig {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const companyId = process.env.QUICKBOOKS_COMPANY_ID || '9341455971522574';
  const accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;
  const refreshToken = process.env.QUICKBOOKS_REFRESH_TOKEN;
  const realmId = process.env.QUICKBOOKS_REALM_ID || companyId;
  const useSandbox = process.env.QUICKBOOKS_USE_SANDBOX !== 'false'; // Default to sandbox

  if (!clientId || !clientSecret) {
    throw new Error('QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET must be set');
  }

  if (!accessToken) {
    throw new Error('QUICKBOOKS_ACCESS_TOKEN must be set. Please complete OAuth setup first.');
  }

  return {
    clientId,
    clientSecret,
    companyId,
    accessToken,
    refreshToken,
    realmId,
    useSandbox,
  };
}

/**
 * Get the base URL for QuickBooks API
 */
function getBaseUrl(useSandbox: boolean): string {
  return useSandbox ? QB_SANDBOX_BASE_URL : QB_PRODUCTION_BASE_URL;
}

/**
 * Refresh OAuth access token using refresh token
 */
async function refreshAccessToken(config: QuickBooksConfig): Promise<string> {
  if (!config.refreshToken) {
    throw new Error('QUICKBOOKS_REFRESH_TOKEN is required to refresh access token');
  }

  const tokenUrl = config.useSandbox
    ? 'https://sandbox-quickbooks.api.intuit.com/oauth2/v1/tokens/bearer'
    : 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Make an authenticated API request to QuickBooks
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let config = getQuickBooksConfig();
  const baseUrl = getBaseUrl(config.useSandbox ?? true);
  const url = `${baseUrl}/${config.companyId}${endpoint}`;

  let accessToken = config.accessToken!;

  // Try the request
  let response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // If unauthorized, try refreshing token
  if (response.status === 401 && config.refreshToken) {
    try {
      accessToken = await refreshAccessToken(config);
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (refreshError) {
      throw new Error(`Failed to refresh token: ${refreshError}`);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `QuickBooks API error: ${response.status}`;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:268',message:'API request failed',data:{status:response.status,statusText:response.statusText,errorText,url,endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    try {
      const errorData: QuickBooksError = JSON.parse(errorText);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:275',message:'Parsed error response',data:{errorData:JSON.stringify(errorData),errorCode:errorData.Fault?.Error?.[0]?.code,errorMessage:errorData.Fault?.Error?.[0]?.Message,errorDetail:errorData.Fault?.Error?.[0]?.Detail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (errorData.Fault?.Error?.[0]) {
        errorMessage = `QuickBooks API error: ${errorData.Fault.Error[0].Message} (${errorData.Fault.Error[0].code})`;
      }
    } catch {
      errorMessage = `QuickBooks API error: ${response.status} ${errorText}`;
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Execute a SQL-like query against QuickBooks
 */
export async function query<T>(queryString: string): Promise<T[]> {
  const encodedQuery = encodeURIComponent(queryString);
  const response = await apiRequest<QuickBooksQueryResponse<T>>(
    `/query?query=${encodedQuery}`
  );

  // Extract entities from response (entity name varies)
  const queryResponse = response.QueryResponse;
  if (!queryResponse) {
    return [];
  }

  // Find the entity array in the response
  for (const key in queryResponse) {
    if (key !== 'maxResults' && key !== 'startPosition' && Array.isArray(queryResponse[key])) {
      return queryResponse[key] as T[];
    }
  }

  return [];
}

/**
 * Find a customer by email address
 */
export async function findCustomerByEmail(email: string): Promise<QuickBooksCustomer | null> {
  const queryString = `SELECT * FROM Customer WHERE PrimaryEmailAddr = '${email.replace(/'/g, "''")}'`;
  const customers = await query<QuickBooksCustomer>(queryString);
  return customers.length > 0 ? customers[0] : null;
}

/**
 * Create a new customer in QuickBooks
 */
export async function createCustomer(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<QuickBooksCustomer> {
  const customerData: Partial<QuickBooksCustomer> = {
    PrimaryEmailAddr: {
      Address: email,
    },
  };

  // QuickBooks requires at least one name field. Use DisplayName as fallback.
  if (firstName && lastName) {
    customerData.GivenName = firstName;
    customerData.FamilyName = lastName;
  } else if (firstName) {
    customerData.GivenName = firstName;
    customerData.DisplayName = firstName;
  } else if (lastName) {
    customerData.FamilyName = lastName;
    customerData.DisplayName = lastName;
  } else {
    // No name provided - use email as DisplayName (QuickBooks requirement)
    customerData.DisplayName = email;
  }

  const response = await apiRequest<{ Customer: QuickBooksCustomer }>(
    '/customer',
    {
      method: 'POST',
      body: JSON.stringify(customerData),
    }
  );

  return response.Customer;
}

/**
 * Find or create a customer by email
 */
export async function getOrCreateCustomer(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<QuickBooksCustomer> {
  let customer = await findCustomerByEmail(email);
  
  if (!customer) {
    customer = await createCustomer(email, firstName, lastName);
  }
  
  if (!customer.Id) {
    throw new Error('Customer created but missing ID');
  }
  
  return customer;
}

/**
 * Find an item by name (SKU lookup)
 */
export async function findItemByName(name: string): Promise<QuickBooksItem | null> {
  const queryString = `SELECT * FROM Item WHERE Name = '${name.replace(/'/g, "''")}'`;
  const items = await query<QuickBooksItem>(queryString);
  return items.length > 0 ? items[0] : null;
}

/**
 * Create a new item (Service type) in QuickBooks
 */
export async function createItem(name: string): Promise<QuickBooksItem> {
  const itemData: Partial<QuickBooksItem> = {
    Name: name,
    Type: 'Service',
  };

  const response = await apiRequest<{ Item: QuickBooksItem }>(
    '/item',
    {
      method: 'POST',
      body: JSON.stringify(itemData),
    }
  );

  return response.Item;
}

/**
 * Get or create an item by name
 */
export async function getOrCreateItem(name: string): Promise<QuickBooksItem> {
  let item = await findItemByName(name);
  
  if (!item) {
    item = await createItem(name);
  }
  
  if (!item.Id) {
    throw new Error(`Item "${name}" created but missing ID`);
  }
  
  return item;
}

/**
 * Find or create a category (Class) by course code
 * Note: QuickBooks uses "Class" for categorization
 */
export async function findOrCreateCategory(courseCode: string): Promise<{ Id: string; Name: string } | null> {
  if (!courseCode) {
    return null;
  }

  // Query for Class by name
  const queryString = `SELECT * FROM Class WHERE Name = '${courseCode.replace(/'/g, "''")}'`;
  const classes = await query<{ Id: string; Name: string }>(queryString);
  
  if (classes.length > 0) {
    return classes[0];
  }

  // Create new Class
  const classData = {
    Name: courseCode,
  };

  try {
    const response = await apiRequest<{ Class: { Id: string; Name: string } }>(
      '/class',
      {
        method: 'POST',
        body: JSON.stringify(classData),
      }
    );
    return response.Class;
  } catch (error: any) {
    // If Class creation fails (e.g., not enabled in QB), return null
    console.warn(`Failed to create Class for course code ${courseCode}:`, error.message);
    return null;
  }
}

/**
 * Find or create a subcategory (Department) by class ID
 * Note: QuickBooks uses "Department" for subcategorization
 */
export async function findOrCreateSubcategory(
  classId: string,
  categoryId?: string
): Promise<{ Id: string; Name: string } | null> {
  if (!classId) {
    return null;
  }

  // Query for Department by name (using classId as name)
  const queryString = `SELECT * FROM Department WHERE Name = '${classId.replace(/'/g, "''")}'`;
  const departments = await query<{ Id: string; Name: string }>(queryString);
  
  if (departments.length > 0) {
    return departments[0];
  }

  // Create new Department
  // Note: Departments in QuickBooks are independent entities and cannot reference Classes as parents
  const departmentData = {
    Name: classId,
  };

  try {
    const response = await apiRequest<{ Department: { Id: string; Name: string } }>(
      '/department',
      {
        method: 'POST',
        body: JSON.stringify(departmentData),
      }
    );
    return response.Department;
  } catch (error: any) {
    // If Department creation fails (e.g., not enabled in QB), return null
    console.warn(`Failed to create Department for class ID ${classId}:`, error.message);
    return null;
  }
}

/**
 * Create an invoice in QuickBooks with custom quantity
 */
async function createInvoiceWithQuantity(
  customerId: string,
  itemId: string,
  unitPrice: number, // Full price in cents
  quantity: number,
  description?: string,
  classId?: string,
  departmentId?: string,
  customFields?: Array<{ Name: string; StringValue: string }>
): Promise<QuickBooksInvoice> {
  // Convert unit price from cents to dollars
  const unitPriceInDollars = unitPrice / 100;
  const amountInDollars = unitPriceInDollars * quantity;

  const lineItem: any = {
    DetailType: 'SalesItemLineDetail',
    Amount: amountInDollars,
    SalesItemLineDetail: {
      ItemRef: {
        value: itemId,
      },
      Qty: quantity,
      UnitPrice: unitPriceInDollars,
    },
    Description: description,
  };

  // Add Class (category) if available
  if (classId) {
    lineItem.SalesItemLineDetail.ClassRef = {
      value: classId,
    };
  }

  // Note: DepartmentRef is NOT supported in SalesItemLineDetail by QuickBooks API
  // QuickBooks only supports ClassRef for line item categorization
  // DepartmentRef cannot be used in invoice line items - it's not a valid property

  const invoiceData: Partial<QuickBooksInvoice> = {
    CustomerRef: {
      value: customerId,
    },
    Line: [lineItem],
  };

  // Add custom fields if provided
  if (customFields && customFields.length > 0) {
    invoiceData.CustomField = customFields.map(field => ({
      DefinitionId: '1', // Standard custom field definition
      StringValue: field.StringValue,
      Name: field.Name,
    }));
  }

  const response = await apiRequest<{ Invoice: QuickBooksInvoice }>(
    '/invoice',
    {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    }
  );

  return response.Invoice;
}

/**
 * Create an invoice in QuickBooks
 */
export async function createInvoice(
  customerId: string,
  itemId: string,
  amount: number,
  description?: string,
  classId?: string,
  departmentId?: string,
  customFields?: Array<{ Name: string; StringValue: string }>
): Promise<QuickBooksInvoice> {
  // Convert amount from cents to dollars
  const amountInDollars = amount / 100;

  const lineItem: any = {
    DetailType: 'SalesItemLineDetail',
    Amount: amountInDollars,
    SalesItemLineDetail: {
      ItemRef: {
        value: itemId,
      },
      Qty: 1,
      UnitPrice: amountInDollars,
    },
    Description: description,
  };

  // Add Class (category) if available
  if (classId) {
    lineItem.SalesItemLineDetail.ClassRef = {
      value: classId,
    };
  }

  // Note: DepartmentRef is NOT supported in SalesItemLineDetail by QuickBooks API
  // QuickBooks only supports ClassRef for line item categorization
  // DepartmentRef cannot be used in invoice line items - it's not a valid property
  // If we need subcategory tracking, we should use custom fields instead

  const invoiceData: Partial<QuickBooksInvoice> = {
    CustomerRef: {
      value: customerId,
    },
    Line: [lineItem],
    // Enable online payments to allow customer payment
    AllowOnlinePayment: true,
    AllowOnlineCreditCardPayment: true,
    AllowOnlineACHPayment: true,
  };

  // Add custom fields if provided
  if (customFields && customFields.length > 0) {
    invoiceData.CustomField = customFields.map(field => ({
      DefinitionId: '1', // Standard custom field definition
      StringValue: field.StringValue,
      Name: field.Name,
    }));
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:583',message:'Before createInvoice API request',data:{invoiceData:JSON.stringify(invoiceData),hasDepartmentRef:false,hasClassRef:!!lineItem.SalesItemLineDetail?.ClassRef,customFieldsCount:customFields?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const response = await apiRequest<{ Invoice: QuickBooksInvoice }>(
    '/invoice',
    {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    }
  );

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:595',message:'After createInvoice API request',data:{hasInvoice:!!response.Invoice,invoiceId:response.Invoice?.Id,hasSyncToken:!!response.Invoice?.SyncToken},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  return response.Invoice;
}

/**
 * Save an invoice (ensures it's not in draft state)
 * Updates the invoice with its current SyncToken to save it
 */
export async function saveInvoice(invoice: QuickBooksInvoice): Promise<QuickBooksInvoice> {
  if (!invoice.Id || !invoice.SyncToken) {
    throw new Error('Invoice must have Id and SyncToken to save');
  }

  // Update invoice to save it (this ensures it appears in invoice list)
  const updateData = {
    Id: invoice.Id,
    SyncToken: invoice.SyncToken,
  };

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:597',message:'Before saveInvoice API request',data:{updateData:JSON.stringify(updateData),invoiceId:invoice.Id,syncToken:invoice.SyncToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const response = await apiRequest<{ Invoice: QuickBooksInvoice }>(
    '/invoice',
    {
      method: 'POST',
      body: JSON.stringify(updateData),
    }
  );

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:610',message:'After saveInvoice API request',data:{hasInvoice:!!response.Invoice,invoiceId:response.Invoice?.Id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  return response.Invoice;
}

/**
 * Get invoice by ID
 * @param invoiceId - The invoice ID
 * @param include - Optional query parameter (e.g., 'invoiceLink' to get share link)
 * @param minorVersion - API minor version (default 36 for invoiceLink support)
 */
export async function getInvoice(invoiceId: string, include?: string, minorVersion: number = 36): Promise<QuickBooksInvoice> {
  let endpoint = `/invoice/${invoiceId}`;
  const params = new URLSearchParams();
  
  if (include) {
    params.append('include', include);
  }
  
  // Use minor version 36+ for invoiceLink support
  params.append('minorversion', minorVersion.toString());
  
  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:650',message:'Before getInvoice API request',data:{endpoint,invoiceId,include,minorVersion},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'G'})}).catch(()=>{});
  // #endregion
  
  const response = await apiRequest<{ Invoice: QuickBooksInvoice }>(endpoint);
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:662',message:'After getInvoice API request',data:{hasInvoice:!!response.Invoice,hasInvoiceLink:!!response.Invoice?.InvoiceLink,hasPaymentLink:!!response.Invoice?.PaymentLink,invoiceLink:response.Invoice?.InvoiceLink,paymentLink:response.Invoice?.PaymentLink},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'G'})}).catch(()=>{});
  // #endregion
  
  // Transform Sandbox URL if needed (based on forum solution)
  if (response.Invoice?.InvoiceLink && response.Invoice.InvoiceLink.includes('developer.intuit.com/comingSoonview/')) {
    // Replace Sandbox URL format with working format
    const transformedLink = response.Invoice.InvoiceLink.replace(
      'https://developer.intuit.com/comingSoonview/',
      'https://connect.intuit.com/t/'
    );
    response.Invoice.InvoiceLink = transformedLink;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:672',message:'Transformed Sandbox invoice link',data:{originalLink:response.Invoice.InvoiceLink,transformedLink},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
  }
  
  return response.Invoice;
}

/**
 * Send invoice via email (this may generate the share link)
 * Note: This actually sends an email, so use carefully
 * @param invoiceId - The invoice ID
 * @param syncToken - The invoice sync token
 * @param emailAddress - Optional email address (uses customer email if not provided)
 */
export async function sendInvoice(invoiceId: string, syncToken: string, emailAddress?: string): Promise<void> {
  const endpoint = `/invoice/${invoiceId}/send?minorversion=65`;
  
  const sendData: any = {
    Invoice: {
      Id: invoiceId,
      SyncToken: syncToken,
    },
  };
  
  if (emailAddress) {
    sendData.Invoice.BillEmail = {
      Address: emailAddress,
    };
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:695',message:'Before sendInvoice API request',data:{invoiceId,syncToken,emailAddress,endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'I'})}).catch(()=>{});
  // #endregion
  
  await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(sendData),
  });
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/12521c72-3f93-40b1-89c8-52ae2b633e31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'quickbooks.ts:707',message:'After sendInvoice API request',data:{invoiceId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'I'})}).catch(()=>{});
  // #endregion
}

/**
 * Create subsequent invoices for tuition payments
 */
export async function createSubsequentInvoices(
  customerId: string,
  tuitionAmount: number,
  classId: string,
  courseCode: string,
  invoice1DueDate?: string,
  invoice2DueDate?: string
): Promise<QuickBooksInvoice[]> {
  const tuitionItem = await getOrCreateItem('tuition');
  const category = await findOrCreateCategory(courseCode);
  const subcategory = await findOrCreateSubcategory(classId, category?.Id);

  // Each invoice is for half the tuition amount with 0.5 quantity
  // Note: We'll create invoices with 0.5 quantity, so amount should be full tuition
  // QuickBooks will calculate: UnitPrice * Qty = Amount
  // So if we want half the tuition, we use 0.5 quantity with full tuition as unit price
  const fullTuitionAmount = tuitionAmount; // Keep full amount, use 0.5 quantity

  const invoices: QuickBooksInvoice[] = [];

  // Create first subsequent invoice with 0.5 quantity
  const invoice1 = await createInvoiceWithQuantity(
    customerId,
    tuitionItem.Id!,
    fullTuitionAmount,
    0.5, // Quantity 0.5
    `Tuition Payment 1 - ${classId}`,
    category?.Id,
    subcategory?.Id,
    [
      { Name: 'ClassID', StringValue: classId },
      { Name: 'PaymentType', StringValue: 'tuition' },
      { Name: 'PaymentNumber', StringValue: '1' },
    ]
  );

  // Set due date if provided
  if (invoice1DueDate && invoice1.Id) {
    try {
      await apiRequest(
        `/invoice`,
        {
          method: 'POST',
          body: JSON.stringify({
            Id: invoice1.Id,
            SyncToken: invoice1.SyncToken || '0',
            DueDate: invoice1DueDate,
          }),
        }
      );
    } catch (error) {
      console.warn('Failed to set due date for invoice 1:', error);
    }
  }

  invoices.push(invoice1);

  // Create second subsequent invoice with 0.5 quantity
  const invoice2 = await createInvoiceWithQuantity(
    customerId,
    tuitionItem.Id!,
    fullTuitionAmount,
    0.5, // Quantity 0.5
    `Tuition Payment 2 - ${classId}`,
    category?.Id,
    subcategory?.Id,
    [
      { Name: 'ClassID', StringValue: classId },
      { Name: 'PaymentType', StringValue: 'tuition' },
      { Name: 'PaymentNumber', StringValue: '2' },
    ]
  );

  // Set due date if provided
  if (invoice2DueDate && invoice2.Id) {
    try {
      await apiRequest(
        `/invoice`,
        {
          method: 'POST',
          body: JSON.stringify({
            Id: invoice2.Id,
            SyncToken: invoice2.SyncToken || '0',
            DueDate: invoice2DueDate,
          }),
        }
      );
    } catch (error) {
      console.warn('Failed to set due date for invoice 2:', error);
    }
  }

  invoices.push(invoice2);

  return invoices;
}

/**
 * Get payment URL from invoice
 * Prioritizes share link (InvoiceLink) which doesn't require login
 * Falls back to constructing customer-facing payment URL using DocNumber
 */
export function getInvoicePaymentUrl(invoice: QuickBooksInvoice, companyId: string, useSandbox: boolean = true): string {
  // First priority: InvoiceLink (share link - no login required)
  if (invoice.InvoiceLink) {
    return invoice.InvoiceLink;
  }

  // Second priority: PaymentLink if available
  if (invoice.PaymentLink) {
    return invoice.PaymentLink;
  }

  // Third priority: Construct customer-facing payment URL using DocNumber
  // QuickBooks customer payment portal URLs use DocNumber for customer access
  if (invoice.DocNumber) {
    // Customer-facing payment portal URL format
    // This allows customers to view and pay without QuickBooks login
    if (useSandbox) {
      // Sandbox payment portal (format may vary - needs testing)
      return `https://payments.intuit.com/invoice/${invoice.DocNumber}`;
    } else {
      // Production payment portal
      return `https://payments.intuit.com/invoice/${invoice.DocNumber}`;
    }
  }

  // Fallback: Construct URL (but this requires login, so not ideal)
  if (invoice.Id) {
    const baseUrl = useSandbox
      ? 'https://app.sandbox.qbo.intuit.com'
      : 'https://app.qbo.intuit.com';
    return `${baseUrl}/app/invoice?txnId=${invoice.Id}`;
  }

  throw new Error('Cannot generate payment URL: invoice missing ID, DocNumber, and payment links');
}

