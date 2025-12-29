'use client';

interface CheckoutPaymentScheduleProps {
  hasRegistrationFee: boolean;
  registrationFee?: number; // in cents
  price?: number; // in cents
  invoice1DueDate?: string;
  invoice2DueDate?: string;
}

export default function CheckoutPaymentSchedule({
  hasRegistrationFee,
  registrationFee,
  price,
  invoice1DueDate,
  invoice2DueDate
}: CheckoutPaymentScheduleProps) {
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return `$${(amount / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  if (!hasRegistrationFee) {
    // Simple payment: just show the price due today
    return (
      <div
        className="checkout-payment-schedule"
        style={{
          backgroundColor: 'var(--text-input-text-input-bg, #eeede8)',
          border: '1px solid var(--color-neutral, #999898)',
          borderRadius: 'var(--radius-small, 8px)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '24px',
          width: '100%'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            lineHeight: 1.4,
            color: 'var(--semantics-text, #191920)'
          }}
        >
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'uppercase',
              margin: 0,
              height: '20px',
              color: 'var(--semantics-text, #191920)'
            }}
          >
            Payment details
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
              width: '100%',
              lineHeight: 1.4
            }}
          >
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                margin: 0,
                color: 'var(--semantics-text, #191920)'
              }}
            >
              {price ? formatCurrency(price) : '$0.00'}
            </p>
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                margin: 0,
                color: 'var(--semantics-text-neutral, #6e6e70)'
              }}
            >
              Due today
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Has registration fee: show registration fee + two installment payments
  const halfPrice = price ? Math.floor(price / 2) : 0;
  const remainder = price ? price - halfPrice : 0;

  return (
    <div
      className="checkout-payment-schedule"
      style={{
        backgroundColor: 'var(--text-input-text-input-bg, #eeede8)',
        border: '1px solid var(--color-neutral, #999898)',
        borderRadius: 'var(--radius-small, 8px)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '24px',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          width: '100%'
        }}
      >
        {/* Registration Fee Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            lineHeight: 1.4,
            color: 'var(--semantics-text, #191920)'
          }}
        >
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'uppercase',
              margin: 0,
              height: '20px',
              color: 'var(--semantics-text, #191920)'
            }}
          >
            Payment details
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
              width: '100%',
              lineHeight: 1.4
            }}
          >
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                margin: 0,
                color: 'var(--semantics-text, #191920)'
              }}
            >
              {registrationFee ? formatCurrency(registrationFee) : '$0.00'} registration fee
            </p>
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                margin: 0,
                color: 'var(--semantics-text-neutral, #6e6e70)'
              }}
            >
              Due today
            </p>
          </div>
        </div>

        {/* Installment Payments Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%'
          }}
        >
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: 1.4,
              margin: 0,
              color: 'var(--semantics-text, #191920)'
            }}
          >
            The remainder of your tuition will be {price ? formatCurrency(price) : '$0.00'} and due in two installments.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              width: '100%',
              marginTop: '1rem'
            }}
          >
            {/* First Payment */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    margin: 0,
                    textTransform: 'uppercase',
                    color: 'var(--semantics-text-neutral, #6e6e70)',
                    width: '100%'
                  }}
                >
                  First Payment
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  lineHeight: 1.4,
                  color: 'var(--semantics-text, #191920)'
                }}
              >
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    margin: 0
                  }}
                >
                  {formatCurrency(halfPrice)}
                </p>
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    margin: 0
                  }}
                >
                  Due {invoice1DueDate ? formatDate(invoice1DueDate) : 'Placeholder date'}
                </p>
              </div>
            </div>

            {/* Second Payment */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    margin: 0,
                    textTransform: 'uppercase',
                    color: 'var(--semantics-text-neutral, #6e6e70)',
                    width: '100%'
                  }}
                >
                  Second payment
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  lineHeight: 1.4,
                  color: 'var(--semantics-text, #191920)'
                }}
              >
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    margin: 0
                  }}
                >
                  {formatCurrency(remainder)}
                </p>
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    margin: 0
                  }}
                >
                  Due {invoice2DueDate ? formatDate(invoice2DueDate) : 'Placeholder date'}
                </p>
              </div>
            </div>
          </div>
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: 1.4,
              margin: 0,
              color: 'var(--semantics-text-neutral, #6e6e70)'
            }}
          >
            You will receive emails reminding you of these dates.
          </p>
        </div>
      </div>
    </div>
  );
}

