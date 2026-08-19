"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { TextInput } from "@/components/admin-migrate/patterns/primitives/TextInput";

export type ClassAddPrerequisiteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
};

/** Add a required prerequisite to this class. */
export function ClassAddPrerequisiteModal({
  isOpen,
  onClose,
  onAdd,
}: ClassAddPrerequisiteModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) setName("");
  }, [isOpen]);

  function handleAdd() {
    const next = name.trim();
    if (!next) {
      toast.error("Enter a prerequisite name");
      return;
    }
    onAdd(next);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add prerequisite"
      width={420}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Add" variant="primary" onClick={handleAdd} />
        </>
      }
    >
      <TextInput label="Name" value={name} onChange={setName} />
    </Modal>
  );
}
