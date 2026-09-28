"use client";

import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import type { TransactionRow } from "@/data/mocks/transactions";

export type CancelTransactionModalProps = {
  isOpen: boolean;
  transaction: TransactionRow | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function CancelTransactionModal({
  isOpen,
  transaction,
  onClose,
  onConfirm,
}: CancelTransactionModalProps) {
  const label = transaction?.invoiceNumber ? `invoice ${transaction.invoiceNumber}` : "this transaction";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel invoice?"
      width={400}
      footer={
        <>
          <Button label="Keep invoice" variant="secondary" onClick={onClose} />
          <Button label="Cancel invoice" variant="primary" onClick={onConfirm} />
        </>
      }
    >
      <Text size="sm" color="secondary">
        Cancel {label}? This marks it cancelled in the demo. It cannot be undone from this screen.
      </Text>
    </Modal>
  );
}
