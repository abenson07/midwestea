import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY is not configured' },
      { status: 500 }
    );
  }

  const debugInfo: any[] = [];
  
  try {
    // Test 1: Simple connectivity test to Stripe API
    debugInfo.push({ step: 'test1_start', message: 'Testing raw fetch to Stripe API' });
    
    const testUrl = 'https://api.stripe.com/v1/customers?limit=1';
    debugInfo.push({ step: 'test1_fetch_start', url: testUrl, timestamp: Date.now() });
    
    const fetchStartTime = Date.now();
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const fetchDuration = Date.now() - fetchStartTime;
    debugInfo.push({ 
      step: 'test1_fetch_complete', 
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: fetchDuration,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText.substring(0, 500) };
    }
    
    debugInfo.push({ 
      step: 'test1_response_parsed',
      hasData: !!responseData,
      dataKeys: responseData ? Object.keys(responseData) : [],
      dataPreview: responseData?.data ? `Found ${responseData.data.length} customers` : 'No data array'
    });
    
    // Test 2: Try creating a customer with raw fetch
    debugInfo.push({ step: 'test2_start', message: 'Testing customer creation with raw fetch' });
    
    const createUrl = 'https://api.stripe.com/v1/customers';
    const createStartTime = Date.now();
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'test-fetch@example.com',
        name: 'Test Fetch Customer',
      }).toString(),
    });
    
    const createDuration = Date.now() - createStartTime;
    debugInfo.push({ 
      step: 'test2_fetch_complete', 
      status: createResponse.status,
      statusText: createResponse.statusText,
      ok: createResponse.ok,
      duration: createDuration,
      headers: Object.fromEntries(createResponse.headers.entries())
    });
    
    const createResponseText = await createResponse.text();
    let createResponseData;
    try {
      createResponseData = JSON.parse(createResponseText);
    } catch {
      createResponseData = { raw: createResponseText.substring(0, 500) };
    }
    
    debugInfo.push({ 
      step: 'test2_response_parsed',
      hasData: !!createResponseData,
      customerId: createResponseData?.id,
      error: createResponseData?.error
    });
    
    return NextResponse.json({
      success: true,
      tests: {
        test1_list: {
          success: response.ok,
          status: response.status,
          duration: fetchDuration,
          data: responseData
        },
        test2_create: {
          success: createResponse.ok,
          status: createResponse.status,
          duration: createDuration,
          data: createResponseData
        }
      },
      debug: debugInfo
    });
    
  } catch (error: any) {
    debugInfo.push({ 
      step: 'error', 
      error: error?.message,
      type: error?.name,
      stack: error?.stack?.substring(0, 500)
    });
    
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      type: error?.name,
      debug: debugInfo
    }, { status: 500 });
  }
}





