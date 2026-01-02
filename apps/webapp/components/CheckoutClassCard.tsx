'use client';

interface CheckoutClassCardProps {
  variant: 'online' | 'in-person';
  state: 'default' | 'active';
  location?: string;
  time?: string;
  date?: string;
  endDate?: string;
  onClick?: () => void;
}

export default function CheckoutClassCard({
  variant,
  state,
  location = 'Raytown, MO',
  time = '3:00pm - 4:00pm',
  date = 'June 5th, 2025',
  endDate,
  onClick
}: CheckoutClassCardProps) {
  const isActive = state === 'active';
  const borderColor = isActive 
    ? 'var(--color-brand-colors-mea-red-lighter, #ff704a)' 
    : 'var(--color-neutral, #999898)';

  const formatDateForDisplay = (dateString: string): string => {
    // Try to parse "January 15th, 2025" format
    const match = dateString.match(/(\w+)\s+(\d+)(\w+),\s+(\d+)/);
    if (match) {
      return `${match[1]} ${match[2]}${match[3]}, ${match[4]}`;
    }
    
    // Try to parse ISO date or other formats
    try {
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
        const year = dateObj.getFullYear();
        
        // Add ordinal suffix
        const getOrdinalSuffix = (n: number): string => {
          const s = ['th', 'st', 'nd', 'rd'];
          const v = n % 100;
          return s[(v - 20) % 10] || s[v] || s[0];
        };
        
        return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
      }
    } catch {
      // Fallback
    }
    
    return dateString;
  };

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

  const getMonthFromDate = (dateString: string): string => {
    // Try to parse "January 15th, 2025" format
    const match = dateString.match(/(\w+)\s+\d+/);
    if (match) {
      return match[1]; // Returns "January"
    }
    
    // Try to parse ISO date or other formats
    try {
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-US', { month: 'long' });
      }
    } catch {
      // Fallback
    }
    
    return 'TBD';
  };

  const formattedDate = formatDate(date);
  const startMonth = getMonthFromDate(date);
  const formattedStartDate = formatDateForDisplay(date);
  const formattedEndDate = endDate ? formatDateForDisplay(endDate) : null;

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
                Starts in {startMonth}
              </p>
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

