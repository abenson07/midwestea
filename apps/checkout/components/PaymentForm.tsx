'use client';

import { useState, FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  clientSecret: string;
  amount: string;
  productName: string;
}

export default function PaymentForm({
  clientSecret,
  amount,
  productName,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [country, setCountry] = useState('United States');
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      // Get basePath from window location or env
      const currentPath = window.location.pathname;
      const basePath = currentPath.startsWith('/checkout') ? '/checkout' : '';
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${basePath}/success`,
          payment_method_data: {
            billing_details: {
              name: nameOnCard,
              email: email,
              address: {
                country: country === 'United States' ? 'US' : undefined,
                postal_code: zipCode,
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'An error occurred');
        setIsLoading(false);
        return;
      }

      // If payment succeeded, redirect to success page
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        router.push('/success');
      } else {
        setError('Payment processing failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
      {/* Stripe PaymentElement - includes Apple Pay, Pay with Link, and Card fields */}
      <div className="flex flex-col gap-2">
        <PaymentElement
          options={{
            paymentMethodOrder: ['apple_pay', 'link', 'card'],
            fields: {
              billingDetails: {
                email: 'never',
                name: 'never',
                address: {
                  country: 'never',
                  postalCode: 'never',
                },
              },
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: false,
            },
          }}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-[#969699]"></div>
        <p 
          className="text-[16px] text-[#6e6e70] whitespace-nowrap"
          style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
        >
          or pay another way
        </p>
        <div className="flex-1 h-px bg-[#969699]"></div>
      </div>

      {/* Email Address */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start">
          <label
            htmlFor="email"
            className="text-[14px] font-semibold text-[#191920] uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
          >
            Email Address <span className="text-red-500">*</span>
          </label>
        </div>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          required
          className="bg-[#eeede8] border border-[#969699] rounded px-3 py-3 text-[16px] text-[#6e6e70] placeholder:opacity-50 focus:outline-none focus:border-[#191920]"
          style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
        />
      </div>

      {/* Name on Card */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start">
          <label
            htmlFor="nameOnCard"
            className="text-[14px] font-semibold text-[#191920] uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
          >
            NAME ON CARD
          </label>
        </div>
        <input
          type="text"
          id="nameOnCard"
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
          placeholder="John Doe"
          className="bg-[#eeede8] border border-[#969699] rounded px-3 py-3 text-[16px] text-[#6e6e70] placeholder:opacity-50 focus:outline-none focus:border-[#191920]"
          style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
        />
      </div>

      {/* Country or Region */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start">
          <label
            htmlFor="country"
            className="text-[14px] font-semibold text-[#191920] uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
          >
            Country or region
          </label>
        </div>
        <input
          type="text"
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="United States"
          className="bg-[#eeede8] border border-[#969699] rounded px-3 py-3 text-[16px] text-[#6e6e70] placeholder:opacity-50 focus:outline-none focus:border-[#191920] mb-2"
          style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
        />
        <input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="97712"
          className="bg-[#eeede8] border border-[#969699] rounded px-3 py-3 text-[16px] text-[#6e6e70] placeholder:opacity-50 focus:outline-none focus:border-[#191920]"
          style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="bg-[#ffb452] border border-[#ffb452] rounded px-4 py-2 flex items-center justify-center text-[12px] font-semibold uppercase text-[#191920] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4' }}
      >
        {isLoading ? 'Processing...' : `Pay ${amount}`}
      </button>
    </form>
  );
}

