"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { FoundationLayout } from "@/components/admin-migrate/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/admin-migrate/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/admin-migrate/patterns/foundation/LinearSidebar";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { useAdminBasePath, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { CatalogOverviewPage } from "./CatalogOverviewPage";
import { CreateClassModal } from "./CreateClassModal";
import {
  catalogListHref,
  catalogSettingsHref,
  catalogTemplateFor,
  classDetailHref,
  classesForTemplate,
  type CatalogTemplate,
} from "./catalogMocks";
import type { ClassDetail } from "../classes/classMocks";

export type CatalogDetailDemoProps = {
  templateId: string;
  /** When omitted, the profile stays on demo mocks (`/admin-preview`). */
  template?: CatalogTemplate;
  classes?: ClassDetail[];
  enrolledCounts?: Map<string, number>;
};

export function CatalogDetailDemo({
  templateId,
  template: templateProp,
  classes: classesProp,
  enrolledCounts,
}: CatalogDetailDemoProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const live = useIsNewAdminMigrate();
  const [template, setTemplate] = useState(
    () => templateProp ?? (live ? undefined : catalogTemplateFor(templateId)),
  );
  const [classes, setClasses] = useState<ClassDetail[]>(
    () => classesProp ?? (template && !live ? classesForTemplate(template.code) : []),
  );
  const [createOpen, setCreateOpen] = useState(false);

  if (!template) {
    return (
      <div style={{ height: "100%" }}>
        <FoundationLayout
          navigation={<LinearSidebar />}
          header={
            <CanvasHeader
              topbar={{
                title: "Template",
                breadcrumbs: [{ label: "Programs", onClick: () => router.push(`${basePath}/programs`) }],
              }}
            />
          }
        >
          <div style={{ padding: 24 }}>
            <Text color="secondary">No template matches this profile.</Text>
          </div>
        </FoundationLayout>
      </div>
    );
  }

  const listHref = `${basePath}${catalogListHref(template.kind)}`;
  const listLabel = template.kind === "Program" ? "Programs" : "Courses";

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: template.name,
              breadcrumbs: [{ label: listLabel, onClick: () => router.push(listHref) }],
              endContent: (
                <Button
                  label="Add Class"
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setCreateOpen(true)}
                />
              ),
            }}
            isControlsVisible={false}
          />
        }
      >
        <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
          <CatalogOverviewPage
            template={template}
            classes={classes}
            onEditDetails={() => router.push(`${basePath}${catalogSettingsHref(template)}`)}
            onCreateClass={() => setCreateOpen(true)}
            onTemplateChange={setTemplate}
            enrolledCounts={enrolledCounts}
          />
        </div>
      </FoundationLayout>
      <CreateClassModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        template={template}
        existingClassCount={classes.length}
        onCreated={(created) => {
          setClasses((prev) => [...prev, created]);
          router.push(`${basePath}${classDetailHref(created.id)}`);
        }}
      />
    </div>
  );
}
