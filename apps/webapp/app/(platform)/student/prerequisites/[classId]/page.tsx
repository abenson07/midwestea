"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Class, EvaluatedPrerequisite, PrerequisiteEvaluation } from "@midwestea/types";
import CheckoutLayout from "@/components/CheckoutLayout";
import { PrerequisiteStepForm } from "@/components/ui/PrerequisiteStepForm";
import { PrerequisiteStatusBadge } from "@/components/ui/PrerequisiteStatusBadge";
import { fetchPrerequisiteEvaluation } from "@/lib/prerequisites";

function CompletionPanel({
  evaluation,
  router,
  fromProfile,
}: {
  evaluation: PrerequisiteEvaluation;
  router: ReturnType<typeof useRouter>;
  fromProfile: boolean;
}) {
  const items = evaluation.items;
  const allSatisfied = items.every((item) => item.status === "satisfied");
  const anyPendingReview = items.some((item) => item.status === "pending_review");

  let heading: string;
  let body: string;

  if (allSatisfied) {
    heading = "You're all set";
    body = "Your class requirements are complete.";
  } else if (anyPendingReview) {
    heading = "Thanks — we're reviewing your submissions";
    body = "We'll email you when review is complete. You can check status any time in your profile.";
  } else {
    heading = "Some requirements are still outstanding";
    body = "You can finish these any time from your profile before class starts.";
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">{heading}</h1>
      <p className="text-sm text-gray-600">{body}</p>
      {items.length > 0 && (
        <ul className="divide-y divide-gray-100 border-y border-gray-200">
          {items.map((item) => (
            <li key={item.class_prerequisite_id} className="py-2 flex items-center justify-between gap-4">
              <span className="text-sm text-gray-900">{item.prerequisite_type.name}</span>
              <PrerequisiteStatusBadge status={item.status} />
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => router.push("/student/profile")}
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
      >
        {fromProfile ? "Back to profile" : "Go to my profile"}
      </button>
    </div>
  );
}

function PrerequisitesWizardContent() {
  const params = useParams<{ classId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const classCode = params.classId;
  const fromProfile = searchParams.get("from") === "profile";

  const [classData, setClassData] = useState<Class | null>(null);
  const [evaluation, setEvaluation] = useState<PrerequisiteEvaluation | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const classResponse = await fetch(`/api/classes/by-class-id/${classCode}`);
        if (!classResponse.ok) {
          const errorData = await classResponse.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || "Failed to load class information");
        }
        const classResult = await classResponse.json();
        const loadedClass = classResult.class as Class;
        setClassData(loadedClass);

        const { evaluation: evaluationResult, error: evaluationError } = await fetchPrerequisiteEvaluation(
          loadedClass.id
        );
        if (evaluationError) {
          throw new Error(evaluationError);
        }
        setEvaluation(evaluationResult);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Failed to load class requirements");
      } finally {
        setLoading(false);
      }
    };

    if (classCode) {
      load();
    }
  }, [classCode]);

  const outstanding: EvaluatedPrerequisite[] = evaluation?.outstanding || [];

  const handleAdvance = () => {
    setStepIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <CheckoutLayout title="Loading...">
        <div>Loading...</div>
      </CheckoutLayout>
    );
  }

  if (error || !classData || !evaluation) {
    return (
      <CheckoutLayout title="Error" buttonText="Go to my profile" onButtonClick={() => router.push("/student/profile")}>
        <div>{error || "Failed to load class requirements"}</div>
      </CheckoutLayout>
    );
  }

  const showCompletion = stepIndex >= outstanding.length;

  return (
    <CheckoutLayout
      imageUrl={classData.class_image || undefined}
      title=""
      titleContent={
        !showCompletion ? (
          <>
            {fromProfile && (
              <Link
                href="/student/profile"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to profile
              </Link>
            )}
            <h1
              style={{
                margin: 0,
                display: "block",
                color: "var(--Color-Scheme-1-Text, #191920)",
                fontFamily: '"PP Neue Corp"',
                fontSize: "var(--Text-Sizes-Heading-4, 32px)",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "90%",
                textTransform: "uppercase",
              }}
            >
              Class requirements
            </h1>
            <p
              style={{
                margin: 0,
                color: "var(--Semantics-Text, #191920)",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "140%",
              }}
            >
              {`Step ${stepIndex + 1} of ${outstanding.length}`}
            </p>
          </>
        ) : undefined
      }
    >
      {showCompletion ? (
        <CompletionPanel evaluation={evaluation} router={router} fromProfile={fromProfile} />
      ) : (
        <PrerequisiteStepForm
          key={outstanding[stepIndex].class_prerequisite_id}
          item={outstanding[stepIndex]}
          classId={classData.id}
          onSubmitted={handleAdvance}
          onSkip={handleAdvance}
        />
      )}
    </CheckoutLayout>
  );
}

export default function PrerequisitesWizardPage() {
  return (
    <Suspense fallback={null}>
      <PrerequisitesWizardContent />
    </Suspense>
  );
}
