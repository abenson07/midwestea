"use client";

import { useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { Text } from "@/components/patterns/primitives/Text";
import { PersonTypeahead } from "./PersonTypeahead";
import {
  STAFF_PERMISSIONS,
  type DirectoryPerson,
  type StaffPermission,
  type StaffRow,
} from "@/data/mocks/staff";

export type AddStaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (row: StaffRow) => void;
};

const today = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
}).format(new Date());

export function AddStaffModal({ isOpen, onClose, onAdd }: AddStaffModalProps) {
  const [person, setPerson] = useState<DirectoryPerson | null>(null);
  const [isTrainer, setIsTrainer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<Set<StaffPermission>>(new Set());

  function reset() {
    setPerson(null);
    setIsTrainer(false);
    setIsAdmin(false);
    setPermissions(new Set());
  }

  function togglePermission(permission: StaffPermission) {
    setPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  }

  function handleSubmit() {
    if (!person) return;
    onAdd({
      id: `staff-${Date.now()}`,
      name: person.name,
      email: person.email,
      phone: "—",
      location: "—",
      isTrainer,
      isAdmin,
      permissions: isAdmin ? Array.from(permissions) : [],
      classes: [],
      lastLoginAt: "Never",
      staffSince: today,
    });
    reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add staff"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={handleClose} />
          <Button
            label="Add staff"
            variant="primary"
            onClick={person ? handleSubmit : undefined}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PersonTypeahead value={person} onChange={setPerson} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Checkbox label="Trainer" value={isTrainer} onChange={setIsTrainer} />
          <Checkbox label="Admin" value={isAdmin} onChange={setIsAdmin} />
        </div>

        {isAdmin ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Text type="label" color="secondary">
              Permissions
            </Text>
            {STAFF_PERMISSIONS.map((permission) => (
              <Checkbox
                key={permission}
                label={permission}
                value={permissions.has(permission)}
                onChange={() => togglePermission(permission)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
