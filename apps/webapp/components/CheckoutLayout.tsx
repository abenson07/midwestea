'use client';

import { ReactNode } from 'react';

interface CheckoutLayoutProps {
  children: ReactNode;
  imageUrl?: string;
  title?: string;
  price?: number; // Price in cents
  registrationFee?: number; // Registration fee in cents
  buttonText?: string;
  onButtonClick?: () => void;
  onBackClick?: () => void;
  logoUrl?: string;
  classesContent?: ReactNode;
}

export default function CheckoutLayout({ 
  children, 
  imageUrl,
  title = 'Checkout',
  price,
  registrationFee,
  buttonText = 'Continue',
  onButtonClick,
  onBackClick,
  logoUrl = 'https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69519dfb03c5fd3b91b0c2f2_Company%20Logo.svg',
  classesContent
}: CheckoutLayoutProps) {
  // Calculate display price: registration fee if exists, otherwise price
  const displayPrice = registrationFee || price || 0;
  const formattedPrice = `$${(displayPrice / 100).toFixed(2)}`;
  return (
    <div className="checkout-section" style={{ width: '100%', height: '100vh', display: 'flex' }}>
      {/* Image Container */}
      <div 
        className="checkout-image-container" 
        style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Checkout" 
            className="checkout-image"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        ) : (
          <div 
            className="checkout-image"
            style={{ 
              width: '100%', 
              height: '100%', 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f0f0f0'
            }}
          />
        )}
      </div>

      {/* Details Container */}
      <div 
        className="checkout-details-container"
        style={{
          height: '100%',
          width: '33%',
          maxWidth: '500px',
          minWidth: '350px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2rem 1rem',
          overflowY: 'auto'
        }}
      >
        {/* Top Section */}
        <div className="checkout-details-top" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Wrapper */}
          <div 
            className="checkout-header-wrapper"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* Go Back Button */}
            <button
              onClick={onBackClick}
              className="checkout-back-button"
              style={{
                border: '1px solid var(--buttons-primary-button-background, #ffb452)',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <p
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: 'var(--buttons-primary-button-text, #191920)',
                  textTransform: 'uppercase',
                  margin: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                Go back
              </p>
            </button>

            {/* Logo */}
            {logoUrl && (
              <img 
                src={logoUrl}
                alt="Logo"
                className="logo-standard"
                style={{
                  height: '32px',
                  width: 'auto'
                }}
              />
            )}
          </div>

          {/* Title Wrapper */}
          <div className="checkout-title-wrapper">
            {title && (
              <h1 
                className="checkout-title" 
                style={{ 
                  margin: 0,
                  display: 'block',
                  color: 'var(--Color-Scheme-1-Text, #191920)',
                  fontFamily: '"PP Neue Corp"',
                  fontSize: 'var(--Text-Sizes-Heading-4, 32px)',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '90%',
                  textTransform: 'uppercase'
                }}
              >
                {title}
              </h1>
            )}
            {displayPrice > 0 && (
              <p 
                className="checkout-price"
                style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  fontFamily: '"PP Neue Corp", sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: '0.9',
                  letterSpacing: 0,
                  color: 'var(--color-scheme-1-text, #191920)',
                  textTransform: 'uppercase',
                  margin: 0,
                  padding: 0
                }}
              >
                {formattedPrice}
              </p>
            )}
          </div>

          {/* Classes Wrapper */}
          <div 
            className="checkout-classes-wrapper"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {classesContent}
          </div>

          {/* Details Wrapper */}
          <div className="checkout-details-wrapper">
            {children}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="checkout-details-bottom">
          {/* Button */}
          {buttonText && (
            <button 
              onClick={onButtonClick}
              className="checkout-button"
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: '#000',
                color: '#fff'
              }}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

