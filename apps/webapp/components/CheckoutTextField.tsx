'use client';

import type { ChangeEvent, ReactNode } from 'react';

interface CheckoutTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'date';
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  max?: string;
  /** Renders a <select> with these options instead of an <input>. */
  options?: { value: string; label: string }[];
  children?: ReactNode;
}

const inputStyle = {
  flex: 1,
  fontFamily: '"DM Sans", sans-serif',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 1.4,
  color: 'var(--text-input-text-input-text, #191920)',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  minWidth: 0,
  padding: 0,
} as const;

export default function CheckoutTextField({
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  type = 'text',
  placeholder,
  autoComplete,
  maxLength,
  max,
  options,
}: CheckoutTextFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange(e.target.value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <p
        style={{
          margin: 0,
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: 1.4,
          color: 'var(--Semantics-Text, #191920)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </p>
      <div
        style={{
          backgroundColor: 'white',
          border: error ? '1px solid #ef4444' : '1px solid var(--color-neutral-light, #969699)',
          borderRadius: 'var(--radius-extra-small, 4px)',
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          width: '100%',
        }}
      >
        {options ? (
          <select
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            autoComplete={autoComplete}
            aria-label={label}
            style={inputStyle}
          >
            <option value="">Select</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={maxLength}
            max={max}
            aria-label={label}
            style={inputStyle}
          />
        )}
      </div>
      {error && (
        <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
}
