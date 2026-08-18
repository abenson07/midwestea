"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { STUDENT_ROWS } from "../students/studentData";
import type { ClassRosterRow } from "./classMocks";

export type ClassAddStudentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roster: ClassRosterRow[];
  onAdd: (student: ClassRosterRow) => void;
};

export function ClassAddStudentModal({
  isOpen,
  onClose,
  roster,
  onAdd,
}: ClassAddStudentModalProps) {
  const [mode, setMode] = useState<"search" | "create">("search");
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setMode("search");
    setQuery("");
    setName("");
    setEmail("");
    setPhone("");
  }, [isOpen]);

  const enrolledEmails = useMemo(
    () => new Set(roster.map((row) => row.email.toLowerCase())),
    [roster],
  );

  const live = useIsNewAdminMigrate();
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || live) return [];
    return STUDENT_ROWS.filter((row) => {
      if (enrolledEmails.has(row.email.toLowerCase())) return false;
      return row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q);
    }).slice(0, 8);
  }, [query, enrolledEmails, live]);

  function enrollExisting(student: { id: string; name: string; email: string }) {
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
            <Button label="Cancel" variant="ghost" onClick={onClose} />
            <Button label="Enroll" variant="primary" onClick={createAndEnroll} />
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
                    onClick={() => enrollExisting(row)}
                    style={{
                      all: "unset",
                      boxSizing: "border-box",
                      cursor: "pointer",
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
