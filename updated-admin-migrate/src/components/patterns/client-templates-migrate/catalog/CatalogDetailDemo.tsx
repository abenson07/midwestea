"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Button } from "@/components/patterns/primitives/Button";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { CatalogOverviewPage } from "./CatalogOverviewPage";
import { CreateClassModal } from "./CreateClassModal";
import {
  catalogListHref,
  catalogSettingsHref,
  catalogTemplateFor,
  classDetailHref,
  classesForTemplate,
} from "./catalogMocks";
import type { ClassDetail } from "../classes/classMocks";

export type CatalogDetailDemoProps = {
  templateId: string;
};

export function CatalogDetailDemo({ templateId }: CatalogDetailDemoProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const [template] = useState(() => catalogTemplateFor(templateId));
  const [classes, setClasses] = useState<ClassDetail[]>(() => classesForTemplate(template.code));
  const [createOpen, setCreateOpen] = useState(false);

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
