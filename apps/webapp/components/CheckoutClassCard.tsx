'use client';

interface CheckoutClassCardProps {
  variant: 'online' | 'in-person';
  state: 'default' | 'active';
  location?: string;
  time?: string;
  date?: string;
  onClick?: () => void;
}

export default function CheckoutClassCard({
  variant,
  state,
  location = 'Raytown, MO',
  time = '3:00pm - 4:00pm',
  date = 'June 5th, 2025',
  onClick
}: CheckoutClassCardProps) {
  const isActive = state === 'active';
  const borderColor = isActive 
    ? 'var(--color-brand-colors-mea-red-lighter, #ff704a)' 
    : 'var(--color-neutral, #999898)';

  const formatDate = (dateString: string): { day: string; suffix: string; year: string } => {
    // Simple parsing for "June 5th, 2025" format
    const match = dateString.match(/(\w+)\s+(\d+)(\w+),\s+(\d+)/);
    if (match) {
      return {
        day: `${match[1]} ${match[2]}`,
        suffix: match[3],
        year: `, ${match[4]}`
      };
    }
    return { day: dateString, suffix: '', year: '' };
  };

  const formattedDate = formatDate(date);

  return (
    <div
      className="checkout-class-card"
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-small, 8px)',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        cursor: onClick ? 'pointer' : 'default',
        width: '100%'
      }}
    >
      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: variant === 'in-person' ? '8px' : 0,
          flex: 1,
          alignItems: 'flex-start'
        }}
      >
        {variant === 'online' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              lineHeight: 1.4,
              width: '100%'
            }}
          >
            <p
              style={{
                fontSize: '16px',
                color: 'var(--semantics-text, #191920)',
                textTransform: 'uppercase',
                margin: 0
              }}
            >
              Online
            </p>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--semantics-text-neutral, #6e6e70)',
                margin: 0,
                marginTop: '4px'
              }}
            >
              This class is held online. In person skills training can be scheduled depending on the class.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600,
                lineHeight: 1.4,
                textTransform: 'uppercase',
                width: '100%'
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--semantics-text-neutral, #6e6e70)',
                  margin: 0
                }}
              >
                In Person
              </p>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--semantics-text, #191920)',
                  margin: 0
                }}
              >
                {location}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px',
                width: '100%'
              }}
            >
              {/* Time Tag */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '24px'
                }}
              >
                {/* Clock icon - nest_clock_farsight_analog */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                    fill="var(--color-neutral-dark, #6e6e70)"
                  />
                </svg>
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: 'var(--color-neutral-dark, #6e6e70)',
                    whiteSpace: 'nowrap',
                    margin: 0
                  }}
                >
                  {time}
                </p>
              </div>

              {/* Date Tag */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '24px'
                }}
              >
                {/* Calendar icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"
                    fill="var(--color-neutral-dark, #6e6e70)"
                  />
                </svg>
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: 'var(--color-neutral-dark, #6e6e70)',
                    whiteSpace: 'nowrap',
                    margin: 0
                  }}
                >
                  <span>{formattedDate.day}</span>
                  <span style={{ fontSize: '7.74px' }}>{formattedDate.suffix}</span>
                  <span>{formattedDate.year}</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Radio Button */}
      <div
        style={{
          width: '18px',
          height: '18px',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        {isActive ? (
          // Active radio (red/orange)
          <div
            style={{
              width: '100%',
              height: '100%',
              border: `2px solid var(--color-brand-colors-mea-red-lighter, #ff704a)`,
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '10px',
                height: '10px',
                backgroundColor: 'var(--color-brand-colors-mea-red-lighter, #ff704a)',
                borderRadius: '50%'
              }}
            />
          </div>
        ) : (
          // Default radio (unselected)
          <div
            style={{
              width: '100%',
              height: '100%',
              border: `2px solid rgba(195, 195, 192, 1)`,
              borderRadius: '50%',
              backgroundColor: 'white'
            }}
          />
        )}
      </div>
    </div>
  );
}

