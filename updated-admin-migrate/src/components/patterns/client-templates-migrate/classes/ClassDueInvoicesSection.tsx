"use client";

import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { classDetailHref } from "../catalog/catalogMocks";
import { ClassBanner } from "./ClassBanner";
import type { TransactionRow } from "@/data/mocks/transactions";

export type ClassDueInvoicesSectionProps = {
  classId: string;
  invoices: TransactionRow[];
};

/** Due transactions for this class — summary banner, goes to the class Transactions page. */
export function ClassDueInvoicesSection({ classId, invoices }: ClassDueInvoicesSectionProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();

  return (
    <div data-slot="class-due-invoices-section">
      <ClassBanner
        icon={<Wallet size={16} strokeWidth={1.75} />}
        label={
          invoices.length
            ? `${invoices.length} transaction${invoices.length === 1 ? "" : "s"} past due`
            : "Payments on track"
        }
        onClick={() => router.push(`${basePath}${classDetailHref(classId)}/transactions`)}
      />
    </div>
  );
}
