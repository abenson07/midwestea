"use client";

import { FileText } from "lucide-react";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { ContentListRow } from "@/components/patterns/client-templates-migrate/content/ContentListRow";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import { Text } from "@/components/patterns/primitives/Text";
import type { CommitteeInitiative } from "@/data/mocks/committees";

export type CommitteeInitiativesPageProps = {
  initiatives: CommitteeInitiative[];
  loading?: boolean;
  onSelectInitiative: (id: string) => void;
  onAddInitiative?: () => void;
};

export function CommitteeInitiativesPage({
  initiatives,
  loading,
  onSelectInitiative,
  onAddInitiative,
}: CommitteeInitiativesPageProps) {
  if (loading) {
    return (
      <ClassContentPage>
        <Text size="sm" color="secondary">
          Loading…
        </Text>
      </ClassContentPage>
    );
  }

  if (initiatives.length === 0) {
    return (
      <ClassContentPage>
        <EmptyStateCard
          variant="pill"
          label="Add new initiative"
          onClick={onAddInitiative}
          minHeight={120}
        />
      </ClassContentPage>
    );
  }

  return (
    <ClassContentPage>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {initiatives.map((initiative) => (
          <ContentListRow
            key={initiative.id}
            icon={<FileText size={16} strokeWidth={1.75} />}
            title={initiative.title}
            subtitle={
              initiative.description.length > 100
                ? `${initiative.description.slice(0, 100)}…`
                : initiative.description || "No description"
            }
            onClick={() => onSelectInitiative(initiative.id)}
          />
        ))}
      </div>
    </ClassContentPage>
  );
}
