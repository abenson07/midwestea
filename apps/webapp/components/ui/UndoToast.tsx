"use client";

import { useEffect, useRef } from "react";

const DEFAULT_DURATION_MS = 5000;

type UndoToastProps = {
    title: string;
    description?: string;
    onUndo: () => void;
    onExpire: () => void;
    durationMs?: number;
};

export function UndoToast({
    title,
    description,
    onUndo,
    onExpire,
    durationMs = DEFAULT_DURATION_MS,
}: UndoToastProps) {
    const progressRef = useRef<HTMLDivElement>(null);
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    useEffect(() => {
        const timer = setTimeout(() => onExpireRef.current(), durationMs);
        return () => clearTimeout(timer);
    }, [durationMs, title, description]);

    useEffect(() => {
        const bar = progressRef.current;
        if (!bar) return;

        bar.style.transition = "none";
        bar.style.width = "100%";
        bar.offsetHeight;
        bar.style.transition = `width ${durationMs}ms linear`;
        bar.style.width = "0%";
    }, [durationMs, title, description]);

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 w-[220px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
            <div className="flex flex-col items-center gap-2 px-4 py-3 text-center">
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-900 leading-snug">{title}</p>
                    {description ? (
                        <p className="text-xs text-gray-500 leading-snug">{description}</p>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={onUndo}
                    className="text-sm font-medium text-black hover:underline"
                >
                    Undo
                </button>
            </div>
            <div className="h-1 w-full bg-gray-100">
                <div ref={progressRef} className="h-full bg-black" style={{ width: "100%" }} />
            </div>
        </div>
    );
}
