"use client";

import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { formatCentsAsUSD, getTransactionAmountCents } from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";

export type MarkPaidModalProps = {
  isOpen: boolean;
  transaction: TransactionRow | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function MarkPaidModal({ isOpen, transaction, onClose, onConfirm }: MarkPaidModalProps) {
  const label = transaction?.invoiceNumber ? `invoice ${transaction.invoiceNumber}` : "this transaction";
  const amount = transaction ? formatCentsAsUSD(getTransactionAmountCents(transaction)) : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark as paid?"
      width={400}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Mark as paid" variant="primary" onClick={onConfirm} />
        </>
      }
    >
      <Text size="sm" color="secondary">
        Mark {label} ({amount}) as paid? This only updates the demo list.
      </Text>
    </Modal>
  );
}
