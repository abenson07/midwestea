"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { TextInput } from "@/components/admin-migrate/patterns/primitives/TextInput";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { STUDENT_ROWS } from "../students/studentData";
import { addStudentToClass, listStudentOptions, type StudentOption } from "./addStudentToClass";
import type { ClassRosterRow } from "./classMocks";

export type ClassAddStudentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roster: ClassRosterRow[];
  onAdd: (student: ClassRosterRow) => void;
  /** Real class UUID. Required when `live`. */
  classId?: string;
  /** Persist through POST /api/admin/enrollments instead of local-only demo state. */
  live?: boolean;
};

export function ClassAddStudentModal({
  isOpen,
  onClose,
  roster,
  onAdd,
  classId,
  live = false,
}: ClassAddStudentModalProps) {
  const [mode, setMode] = useState<"search" | "create">("search");
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [liveStudents, setLiveStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMode("search");
    setQuery("");
    setName("");
    setEmail("");
    setPhone("");
    setBusy(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !live) return;
    let cancelled = false;
    setLoadingStudents(true);
    listStudentOptions().then((result) => {
      if (cancelled) return;
      setLoadingStudents(false);
      if (result.ok) setLiveStudents(result.students);
      else toast.error(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, live]);

  const enrolledEmails = useMemo(
    () => new Set(roster.map((row) => row.email.toLowerCase())),
    [roster],
  );

  const enrolledIds = useMemo(() => new Set(roster.map((row) => row.id)), [roster]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const source: { id: string; name: string; email: string }[] = live ? liveStudents : STUDENT_ROWS;
    return source
      .filter((row) => {
        if (enrolledEmails.has(row.email.toLowerCase()) || enrolledIds.has(row.id)) return false;
        return row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [query, enrolledEmails, enrolledIds, live, liveStudents]);

  async function enrollLive(
    input:
      | { studentId: string }
      | { email: string; fullName: string; phone?: string },
    fallbackName: string,
    fallbackEmail: string,
  ) {
    if (busy) return;
    if (!classId) {
      toast.error("Class not found");
      return;
    }
    setBusy(true);
    const result = await addStudentToClass({ classId, ...input });
    if (!result.ok) {
      setBusy(false);
      toast.error(result.error);
      return;
    }
    onAdd({
      id: result.studentId,
      name: result.name || fallbackName,
      email: result.email || fallbackEmail,
      role: "Student",
      status: "Enrolled",
      enrollmentId: result.enrollmentId,
    });
    setBusy(false);
    toast.success(`${result.restored ? "Restored" : "Enrolled"} ${result.name || fallbackName}`);
    onClose();
  }

  function enrollExisting(student: { id: string; name: string; email: string }) {
    if (live) {
      void enrollLive({ studentId: student.id }, student.name, student.email);
      return;
    }
    onAdd({
      id: `${student.id}-${Date.now()}`,
      name: student.name,
      email: student.email,
      role: "Student",
      status: "Enrolled",
    });
    toast.success(`Enrolled ${student.name}`);
    onClose();
  }

  function createAndEnroll() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (enrolledEmails.has(email.trim().toLowerCase())) {
      toast.error("That student is already in this class");
      return;
    }
    if (live) {
      void enrollLive(
        { email: email.trim(), fullName: name.trim(), phone: phone.trim() || undefined },
        name.trim(),
        email.trim(),
      );
      return;
    }
    onAdd({
      id: `new-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: "Student",
      status: "Enrolled",
    });
    toast.success(`Enrolled ${name.trim()}${phone.trim() ? ` · ${phone.trim()}` : ""}`);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Student"
      width={480}
      footer={
        mode === "create" ? (
          <>
            <Button label="Cancel" variant="ghost" disabled={busy} onClick={onClose} />
            <Button
              label={busy ? "Enrolling…" : "Enroll"}
              variant="primary"
              disabled={busy}
              onClick={createAndEnroll}
            />
          </>
        ) : (
          <Button label="Close" variant="ghost" onClick={onClose} />
        )
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            label="Search existing"
            variant={mode === "search" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMode("search")}
          />
          <Button
            label="Create new"
            variant={mode === "create" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMode("create")}
          />
        </div>

        {mode === "search" ? (
          <>
            <TextInput label="Search by name or email" value={query} onChange={setQuery} />
            {matches.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {matches.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    disabled={busy}
                    onClick={() => enrollExisting(row)}
                    style={{
                      all: "unset",
                      boxSizing: "border-box",
                      cursor: busy ? "not-allowed" : "pointer",
                      opacity: busy ? 0.6 : 1,
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: "var(--linear-color-sidebar-item-hover, transparent)",
                    }}
                  >
                    <Text size="sm" weight="medium" display="block">
                      {row.name}
                    </Text>
                    <Text size="sm" color="secondary" display="block">
                      {row.email}
                    </Text>
                  </button>
                ))}
              </div>
            ) : live && loadingStudents ? (
              <Text size="sm" color="secondary">
                Loading students…
              </Text>
            ) : query.trim() ? (
              <Text size="sm" color="secondary">
                No matching students who aren’t already enrolled.
              </Text>
            ) : (
              <Text size="sm" color="secondary">
                Search the student roster, or create a new student.
              </Text>
            )}
          </>
        ) : (
          <>
            <TextInput label="Name" value={name} onChange={setName} />
            <TextInput label="Email" value={email} onChange={setEmail} />
            <TextInput label="Phone" value={phone} onChange={setPhone} />
          </>
        )}
      </div>
    </Modal>
  );
}
