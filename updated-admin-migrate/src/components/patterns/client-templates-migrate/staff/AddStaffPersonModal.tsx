"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { addStaffLabel, type StaffRole, type StaffView } from "./types";

export type AddStaffPersonModalProps = {
  isOpen: boolean;
  view: StaffView;
  onClose: () => void;
  onAdd: (row: { name: string; email: string; roles: StaffRole[] }) => void;
};

function defaultRoles(view: StaffView): { trainer: boolean; admin: boolean } {
  return {
    trainer: view === "trainers",
    admin: view === "admin",
  };
}

/** Add a staff person with Trainer and/or Admin roles. */
export function AddStaffPersonModal({ isOpen, view, onClose, onAdd }: AddStaffPersonModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isTrainer, setIsTrainer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const defaults = defaultRoles(view);
    setName("");
    setEmail("");
    setIsTrainer(defaults.trainer);
    setIsAdmin(defaults.admin);
  }, [isOpen, view]);

  const canSubmit = Boolean(name.trim() && email.trim() && (isTrainer || isAdmin));
  const title = addStaffLabel(view);

  function handleSubmit() {
    if (!canSubmit) return;
    const roles: StaffRole[] = [];
    if (isTrainer) roles.push("trainer");
    if (isAdmin) roles.push("admin");
    onAdd({ name: name.trim(), email: email.trim(), roles });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label={title} variant="primary" disabled={!canSubmit} onClick={handleSubmit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Name" value={name} onChange={setName} />
        <TextInput label="Email" value={email} onChange={setEmail} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Role</span>
          <Checkbox label="Trainer" value={isTrainer} onChange={setIsTrainer} />
          <Checkbox label="Admin" value={isAdmin} onChange={setIsAdmin} />
        </div>
      </div>
    </Modal>
  );
}
