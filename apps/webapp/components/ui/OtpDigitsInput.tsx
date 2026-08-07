"use client";

import { useEffect, useRef, useState } from "react";

const DIGIT_COUNT = 8;

interface OtpDigitsInputProps {
  /** Current code as a plain string (e.g. from parent state). */
  value: string;
  /** Called with the joined digit string on every change. */
  onChange: (value: string) => void;
  disabled?: boolean;
  idPrefix?: string;
}

/**
 * Eight-box OTP code entry: digit-only input, auto-advance, backspace/arrow
 * navigation, and paste-to-fill. Extracted from student/otp/page.tsx so both
 * the standalone /student/otp page and the inline post-payment flow share
 * one implementation instead of drifting.
 */
export function OtpDigitsInput({ value, onChange, disabled, idPrefix = "otp" }: OtpDigitsInputProps) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: DIGIT_COUNT }, (_, i) => value[i] || "")
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keep internal state in sync when the parent resets `value` externally
  // (e.g. clearing the code after a failed verify attempt).
  useEffect(() => {
    setDigits(Array.from({ length: DIGIT_COUNT }, (_, i) => value[i] || ""));
  }, [value]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const emit = (nextDigits: string[]) => {
    setDigits(nextDigits);
    onChange(nextDigits.join(""));
  };

  const handleDigitChange = (index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];

    if (digit) {
      nextDigits[index] = digit;
      emit(nextDigits);
      if (index < DIGIT_COUNT - 1) {
        focusInput(index + 1);
      }
    } else {
      nextDigits[index] = "";
      emit(nextDigits);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        emit(nextDigits);
        focusInput(index - 1);
      } else if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = "";
        emit(nextDigits);
      }
    } else if (e.key === "Delete") {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      emit(nextDigits);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const pastedDigits = pastedData.replace(/\D/g, "").slice(0, DIGIT_COUNT);

    if (pastedDigits) {
      const nextDigits = [...digits];
      for (let i = 0; i < pastedDigits.length && index + i < DIGIT_COUNT; i++) {
        nextDigits[index + i] = pastedDigits[i];
      }
      emit(nextDigits);
      focusInput(Math.min(index + pastedDigits.length, DIGIT_COUNT - 1));
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          id={`${idPrefix}-${index}`}
          type="text"
          inputMode="numeric"
          value={digit}
          onChange={(e) => handleDigitChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          disabled={disabled}
          maxLength={1}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="w-12 h-14 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center text-2xl font-semibold disabled:opacity-50"
        />
      ))}
    </div>
  );
}
