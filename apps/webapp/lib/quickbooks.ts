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

interface QuickBooksInvoice {
  Id?: string;
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
    
    try {
      const errorData: QuickBooksError = JSON.parse(errorText);
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

  // Add Department (subcategory) if available
  if (departmentId) {
    lineItem.SalesItemLineDetail.DepartmentRef = {
      value: departmentId,
    };
  }

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

  // Add Department (subcategory) if available
  if (departmentId) {
    lineItem.SalesItemLineDetail.DepartmentRef = {
      value: departmentId,
    };
  }

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
 * Get invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<QuickBooksInvoice> {
  const response = await apiRequest<{ Invoice: QuickBooksInvoice }>(
    `/invoice/${invoiceId}`
  );
  return response.Invoice;
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
 * QuickBooks provides InvoiceLink or we construct it from invoice ID
 */
export function getInvoicePaymentUrl(invoice: QuickBooksInvoice, companyId: string, useSandbox: boolean = true): string {
  // Try to use provided payment link
  if (invoice.PaymentLink) {
    return invoice.PaymentLink;
  }

  if (invoice.InvoiceLink) {
    return invoice.InvoiceLink;
  }

  // Construct payment URL if we have invoice ID
  if (invoice.Id) {
    const baseUrl = useSandbox
      ? 'https://app.sandbox.qbo.intuit.com'
      : 'https://app.qbo.intuit.com';
    return `${baseUrl}/app/invoice?txnId=${invoice.Id}`;
  }

  throw new Error('Cannot generate payment URL: invoice missing ID and payment links');
}

