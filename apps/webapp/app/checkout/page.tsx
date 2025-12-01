'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/PaymentForm';

// Suppress unhandled promise rejections from Stripe analytics (blocked by ad blockers)
// Only set up once globally to prevent duplicate listeners
if (typeof window !== 'undefined' && !(window as any).__stripeErrorSuppressed) {
  (window as any).__stripeErrorSuppressed = true;
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress errors from Stripe analytics endpoints that are blocked by ad blockers
    if (
      event.reason?.message?.includes('r.stripe.com') ||
      event.reason?.message?.includes('Failed to fetch') ||
      (typeof event.reason === 'string' && event.reason.includes('r.stripe.com'))
    ) {
      event.preventDefault();
    }
  });
}

// Stripe will be loaded after we get the config
let stripePromise: Promise<any> | null = null;

async function getStripePromise() {
  if (stripePromise) {
    return stripePromise;
  }
  
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (key) {
    stripePromise = Promise.resolve(loadStripe(key));
    return stripePromise;
  }
  
  // Fetch from API if not available at build time
  const basePath = typeof window !== 'undefined' 
    ? (window.location.pathname.startsWith('/app') ? '/app' : '')
    : '';
  const response = await fetch(`${basePath}/api/config`);
  const config = await response.json();
  stripePromise = Promise.resolve(loadStripe(config.stripePublishableKey || ''));
  return stripePromise;
}

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  images: string[];
}

interface PriceData {
  id: string;
  amount: number;
  currency: string;
  formattedAmount: string;
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [price, setPrice] = useState<PriceData | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripePromiseValue, setStripePromiseValue] = useState<Promise<any> | null>(null);
  const prevProductIdRef = useRef<string | null>(null);

  // Load Stripe on mount
  useEffect(() => {
    getStripePromise().then(setStripePromiseValue);
  }, []);

  useEffect(() => {
    const productIdParam = searchParams.get('productId');
    
    if (!productIdParam) {
      setError('Product ID is required. Please provide a productId in the URL.');
      setLoading(false);
      return;
    }

    // Only initialize if product ID actually changed
    if (productIdParam !== prevProductIdRef.current) {
      prevProductIdRef.current = productIdParam;
      setProductId(productIdParam);
      setLoading(true);
      setError(null);
      // Clear previous state when switching products
      setProduct(null);
      setPrice(null);
      setClientSecret(null);
      initializePayment(productIdParam);
    }
  }, [searchParams]);

  const initializePayment = async (prodId: string) => {
    try {
      // API path with basePath - Next.js will handle the /app prefix automatically
      const apiPath = '/app/checkout/api/create-payment-intent';
      
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: prodId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const data = await response.json();
      setProduct(data.product);
      setPrice(data.price);
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message || 'Failed to load product information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !product || !price || !clientSecret) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Failed to load checkout'}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="min-h-screen bg-[#eeede8]">
      <div className="flex gap-[48px] p-[48px]">
        {/* Left Section - Product Information */}
        <div className="flex-1 flex flex-col justify-between min-h-[calc(100vh-96px)]">
          {/* Go Back Button */}
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="border border-[#ffb452] px-4 py-2 rounded text-[12px] font-semibold uppercase text-[#191920] hover:bg-[#ffb452] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
            >
              Go back
            </button>
          </div>

          {/* Product Information */}
          <div className="flex flex-col gap-4">
            {/* Price and Title */}
            <div className="flex flex-col gap-2">
              <p 
                className="text-[32px] font-bold text-[#191920] uppercase leading-[0.9]"
                style={{ fontFamily: "'PP Neue Corp', sans-serif" }}
              >
                {price.formattedAmount}
              </p>
              <h1 
                className="text-[56px] font-bold text-[#191920] uppercase leading-[0.9]"
                style={{ fontFamily: "'PP Neue Corp', sans-serif" }}
              >
                {product.name}
              </h1>
            </div>

            {/* Product Description */}
            {product.description && (
              <p 
                className="text-[12px] text-[#191920] leading-[1.4]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {product.description}
              </p>
            )}
          </div>

          {/* Spacer for bottom alignment */}
          <div className="opacity-0 pointer-events-none">
            <button className="border border-[#ffb452] px-4 py-2 rounded text-[12px] font-semibold uppercase text-[#191920]">
              Save & continue
            </button>
          </div>
        </div>

        {/* Right Section - Payment Form */}
        <div className="max-w-[600px] flex-1 flex items-center justify-center">
          <div className="bg-[#f7f6f3] max-w-[475px] p-10 flex flex-col gap-6">
            {stripePromiseValue && (
              <Elements 
                key={clientSecret} 
                stripe={stripePromiseValue} 
                options={options}
              >
              <PaymentForm
                clientSecret={clientSecret}
                amount={price.formattedAmount}
                productName={product.name}
              />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

