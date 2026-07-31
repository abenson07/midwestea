"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@midwestea/utils";
import {
  RECOMMENDATION_COURSES,
  MIN_RECOMMENDATIONS,
  MAX_RECOMMENDATIONS,
  type RecommendationAnswers,
} from "@/lib/course-recommendations-data";

const STORAGE_KEY = "mwea-course-recommendation-quiz-v1";

interface StoredState {
  answers: RecommendationAnswers;
  currentIndex: number;
}

function loadStoredState(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
      currentIndex: typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
    };
  } catch {
    return null;
  }
}

export default function RecommendCoursesPage() {
  const [answers, setAnswers] = useState<RecommendationAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = loadStoredState();
    if (stored) {
      setAnswers(stored.answers);
      setCurrentIndex(Math.min(stored.currentIndex, RECOMMENDATION_COURSES.length - 1));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || submitted) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers, currentIndex })
    );
  }, [answers, currentIndex, hydrated, submitted]);

  const currentCourse = RECOMMENDATION_COURSES[currentIndex];
  const isLastCourse = currentIndex === RECOMMENDATION_COURSES.length - 1;
  const selected = answers[currentCourse.code] || [];

  const otherCourses = useMemo(
    () => RECOMMENDATION_COURSES.filter((c) => c.code !== currentCourse.code),
    [currentCourse.code]
  );

  const canAdvance =
    selected.length >= MIN_RECOMMENDATIONS && selected.length <= MAX_RECOMMENDATIONS;

  const toggleCourse = (code: string) => {
    setAnswers((prev) => {
      const current = prev[currentCourse.code] || [];
      const isSelected = current.includes(code);

      if (isSelected) {
        return { ...prev, [currentCourse.code]: current.filter((c) => c !== code) };
      }

      if (current.length >= MAX_RECOMMENDATIONS) return prev;

      return { ...prev, [currentCourse.code]: [...current, code] };
    });
  };

  const handleBack = () => {
    setError("");
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (!canAdvance) {
      setError(`Pick between ${MIN_RECOMMENDATIONS} and ${MAX_RECOMMENDATIONS} courses to continue.`);
      return;
    }
    setError("");
    setCurrentIndex((i) => Math.min(RECOMMENDATION_COURSES.length - 1, i + 1));
  };

  const handleSubmit = async () => {
    if (!canAdvance) {
      setError(`Pick between ${MIN_RECOMMENDATIONS} and ${MAX_RECOMMENDATIONS} courses to submit.`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = await createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("Your session has expired. Please log in again.");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/admin/recommend-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Failed to submit. Please try again.");
        setSubmitting(false);
        return;
      }

      window.localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartOver = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setError("");
    window.localStorage.removeItem(STORAGE_KEY);
  };

  if (!hydrated) {
    return null;
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Thanks — you're all set!</h1>
        <p className="text-gray-600 mb-6">
          Your course recommendations have been emailed to Alex.
        </p>
        <button
          type="button"
          onClick={handleStartOver}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          Start a new response
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500 mb-1">
          Course {currentIndex + 1} of {RECOMMENDATION_COURSES.length}
        </p>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 transition-all"
            style={{
              width: `${((currentIndex + 1) / RECOMMENDATION_COURSES.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        {currentCourse.name} ({currentCourse.code})
      </h1>
      <p className="text-gray-600 mb-6">
        Pick the top {MIN_RECOMMENDATIONS}–{MAX_RECOMMENDATIONS} courses you'd recommend to
        someone who just completed this course.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {otherCourses.map((course) => {
          const isChecked = selected.includes(course.code);
          const disabled = !isChecked && selected.length >= MAX_RECOMMENDATIONS;
          return (
            <label
              key={course.code}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                isChecked
                  ? "border-gray-900 bg-gray-50"
                  : disabled
                  ? "border-gray-200 opacity-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={disabled}
                onChange={() => toggleCourse(course.code)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-900">{course.name}</span>
            </label>
          );
        })}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {selected.length} of {MAX_RECOMMENDATIONS} selected
        {selected.length < MIN_RECOMMENDATIONS ? ` (need at least ${MIN_RECOMMENDATIONS})` : ""}
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {isLastCourse ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canAdvance}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
