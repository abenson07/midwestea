'use client';

import { ReactNode, useState, useEffect } from 'react';

interface CheckoutLayoutProps {
  children: ReactNode;
  imageUrl?: string;
  title?: string;
  titleContent?: ReactNode;
  price?: number; // Price in cents
  registrationFee?: number; // Registration fee in cents
  buttonText?: string;
  onButtonClick?: () => void;
  onBackClick?: () => void;
  logoUrl?: string;
  classesContent?: ReactNode;
  emailField?: ReactNode;
  fullNameField?: ReactNode;
  wrapperClassName?: string; // Custom className for checkout-details-wrapper
}

export default function CheckoutLayout({ 
  children, 
  imageUrl,
  title = 'Checkout',
  titleContent,
  price,
  registrationFee,
  buttonText = 'Continue',
  onButtonClick,
  onBackClick,
  logoUrl = 'https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69519dfb03c5fd3b91b0c2f2_Company%20Logo.svg',
  classesContent,
  emailField,
  fullNameField,
  wrapperClassName = 'checkout-details-wrapper'
}: CheckoutLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };
    
    // Check on mount
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate display price: registration fee if exists, otherwise price
  const displayPrice = registrationFee || price || 0;
  const formattedPrice = `$${(displayPrice / 100).toFixed(2)}`;
  
  const backgroundImageStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : {};
  return (
    <div className="checkout-section" style={{ width: '100%', height: '100vh', display: isMobile ? 'block' : 'flex' }}>
      {/* Image Container */}
      {!isMobile && (
        <div 
          className="checkout-image-container" 
          style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}
        >
        <div 
          className="checkout-image"
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#f0f0f0',
            ...backgroundImageStyle
          }}
        />
        </div>
      )}

      {/* Details Container */}
      <div 
        className="checkout-details-container"
        style={{
          height: '100%',
          width: isMobile ? '100%' : '33%',
          maxWidth: isMobile ? '100%' : '500px',
          minWidth: isMobile ? '100%' : '350px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#F7F6F3'
        }}
      >
        {/* Top Section */}
        <div className="checkout-details-top" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1, overflowY: 'auto', minHeight: 0, padding: '2rem 1rem 2rem 1rem' }}>
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
          <div className="checkout-title-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {titleContent ? (
              titleContent
            ) : (
              <>
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
                      margin: 0,
                      padding: 0,
                      fontFamily: '"PP Neue Corp", sans-serif',
                      fontSize: '20px',
                      fontWeight: 700,
                      lineHeight: '0.9',
                      letterSpacing: 0,
                      color: 'var(--color-scheme-1-text, #191920)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {formattedPrice}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Full Name Wrapper */}
          {fullNameField && (
            <div className="checkout-fullname-wrapper">
              {fullNameField}
            </div>
          )}

          {/* Email Wrapper */}
          {emailField && (
            <div className="checkout-email-wrapper">
              {emailField}
            </div>
          )}

          {/* Classes Wrapper - only show if there are multiple classes */}
          {classesContent && (
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
          )}

          {/* Details Wrapper */}
          <div className={wrapperClassName}>
            {children}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="checkout-details-bottom" style={{ padding: '0 1rem 2rem 1rem' }}>
          {/* Button */}
          {buttonText && (
            <button 
              onClick={onButtonClick}
              className="checkout-button"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: '"DM Sans", sans-serif',
                lineHeight: 1.4,
                border: '1px solid var(--buttons-primary-button-background, #ffb452)',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'var(--buttons-primary-button-background, #ffb452)',
                color: '#000',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{buttonText}</span>
              {/* Arrow icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z"
                  fill="#000"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

