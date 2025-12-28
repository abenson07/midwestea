'use client';

interface CheckoutClassDescriptionProps {
  variant: 'online' | 'in-person';
  description: string;
  // In-person specific props
  startDate?: string;
  endDate?: string;
  location?: string;
  frequency?: string;
}

export default function CheckoutClassDescription({
  variant,
  description,
  startDate,
  endDate,
  location,
  frequency
}: CheckoutClassDescriptionProps) {
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div
      className="checkout-class-description"
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
      {/* Program Description Section */}
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
            height: '20px'
          }}
        >
          Program Description
        </p>
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.4,
            margin: 0
          }}
        >
          {description}
        </p>
      </div>

      {/* Variant-specific content */}
      {variant === 'online' ? (
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: 1.4,
            margin: 0,
            width: '100%'
          }}
        >
          This is an online course. Once complete, you'll schedule a time for an in-person skills training with one of our instructors.
        </p>
      ) : (
        <div
          className="class-details-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content auto',
            gap: '8px 18px',
            width: '100%',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: 1.4,
            textTransform: 'uppercase'
          }}
        >
          {/* Start Date */}
          <p style={{ margin: 0, color: 'var(--semantics-text-neutral, #6e6e70)' }}>
            Start date
          </p>
          <p style={{ margin: 0, color: 'var(--semantics-text, #191920)' }}>
            {startDate ? formatDate(startDate) : 'Placeholder date'}
          </p>

          {/* End Date */}
          <p style={{ margin: 0, color: 'var(--semantics-text-neutral, #6e6e70)' }}>
            End date
          </p>
          <p style={{ margin: 0, color: 'var(--semantics-text, #191920)' }}>
            {endDate ? formatDate(endDate) : 'Placeholder date'}
          </p>

          {/* Location */}
          <p style={{ margin: 0, color: 'var(--semantics-text-neutral, #6e6e70)', alignSelf: 'flex-start' }}>
            Location
          </p>
          <div style={{ color: 'var(--semantics-text, #191920)', whiteSpace: 'nowrap' }}>
            {location ? (
              location.split(',').map((line, index, array) => (
                <p key={index} style={{ margin: 0 }}>
                  {line.trim()}{index < array.length - 1 ? ',' : ''}
                </p>
              ))
            ) : (
              <>
                <p style={{ margin: 0 }}>Placeholder address,</p>
                <p style={{ margin: 0 }}>Placeholder city, ST</p>
                <p style={{ margin: 0 }}>12345</p>
              </>
            )}
          </div>

          {/* Frequency */}
          <p style={{ margin: 0, color: 'var(--semantics-text-neutral, #6e6e70)', alignSelf: 'flex-start' }}>
            Frequency
          </p>
          <div style={{ color: 'var(--semantics-text, #191920)', whiteSpace: 'nowrap' }}>
            {frequency ? (
              frequency.split('\n').map((line, index) => (
                <p key={index} style={{ margin: 0 }}>
                  {line}
                </p>
              ))
            ) : (
              <>
                <p style={{ margin: 0 }}>Placeholder days</p>
                <p style={{ margin: 0 }}>Placeholder time</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

