"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface PrerequisiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Small centered modal for handling one outstanding prerequisite at a time
 * from /student/profile. No title prop -- PrerequisiteStepForm renders its
 * own heading (the prerequisite type's name), so this only needs a close
 * affordance. Escape-key close and body-scroll lock mirror DetailSidebar's
 * behavior, adapted to centered dialog styling instead of a slide-in panel.
 */
export function PrerequisiteModal({ isOpen, onClose, children }: PrerequisiteModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}
