"use client";

import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";

export type ArchivePrerequisiteModalProps = {
  isOpen: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ArchivePrerequisiteModal({
  isOpen,
  name,
  onConfirm,
  onCancel,
}: ArchivePrerequisiteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Archive prerequisite"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, width: "100%" }}>
          <Button label="Cancel" variant="ghost" onClick={onCancel} />
          <Button label="Archive" variant="primary" onClick={onConfirm} />
        </div>
      }
    >
      <Text size="sm" color="secondary">
        Archive{" "}
        <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{name}</span>? It stays
        on classes that already use it.
      </Text>
    </Modal>
  );
}
