"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { getSession, signOut } from "@/lib/auth";
import { getStudentById } from "@/lib/students";

export function AccountMenu() {
  const router = useRouter();
  const [isStudent, setIsStudent] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { session } = await getSession();
      if (!session) {
        setIsStudent(false);
        return;
      }
      const { student } = await getStudentById(session.user.id);
      setIsStudent(!!student);
    };
    load();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!isStudent) return null;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/student/login");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="flex items-center justify-center rounded-full p-1 text-text hover:opacity-80"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <CircleUserRound className="h-7 w-7" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-neutral-lighter bg-white py-1 shadow-lg">
          <Link
            href="/student"
            className="block px-4 py-2 text-sm font-medium text-text hover:bg-neutral-lightest"
            onClick={() => setOpen(false)}
          >
            Account Overview
          </Link>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm font-medium text-text hover:bg-neutral-lightest"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
