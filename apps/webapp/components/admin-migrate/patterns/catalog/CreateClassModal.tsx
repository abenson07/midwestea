"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { AccordionSection } from "@/components/admin-migrate/patterns/shared/AccordionSection";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { TextInput } from "@/components/admin-migrate/patterns/primitives/TextInput";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { Grid } from "@/components/admin-migrate/patterns/primitives/Grid";
import { LocationSelect } from "@/components/admin-migrate/patterns/locations";
import { Checkbox } from "@/components/admin-migrate/patterns/primitives/Checkbox";
import { subtractIsoDays, todayIsoDate } from "@/lib/dates";
import { isClassOnline, registerCreatedClass, type ClassDetail } from "../classes/classMocks";
import { CatalogTemplateTypeahead } from "./CatalogTemplateTypeahead";
import {
  CATALOG_CLASS_TYPES,
  CATALOG_TEMPLATES,
  catalogTemplateHref,
  classesForTemplate,
  isCatalogClassOnline,
  nextClassCode,
  type CatalogClassType,
  type CatalogTemplate,
} from "./catalogMocks";
import { createClass } from "@/lib/classes";
import { isUuid } from "@/lib/admin-migrate/ids";
import { parseDisplayCents, parseLeadingInt } from "@/lib/admin-migrate/display-parsers";

export type CreateClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** When set, the program/course is locked. When omitted, the first field is a picker. */
  template?: CatalogTemplate | null;
  existingClassCount?: number;
  onCreated: (created: ClassDetail) => void;
};

type FormState = {
  templateId: string;
  classStart: string;
  classEnd: string;
  enrollmentStart: string;
  enrollmentClose: string;
  price: string;
  registrationFee: string;
  certificationLength: string;
  registrationLimit: string;
  classFormat: CatalogClassType;
  location: string;
  chargeFullAmountAtRegistration: boolean;
};

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
const selectStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

function inheritFromTemplate(template: CatalogTemplate): Pick<
  FormState,
  "price" | "registrationFee" | "certificationLength" | "registrationLimit" | "classFormat" | "location"
> {
  return {
    price: template.price,
    registrationFee: template.registrationFee,
    certificationLength: template.certificationLength,
    registrationLimit: template.registrationLimit,
    classFormat: template.defaultClassFormat,
    location: template.defaultLocation,
  };
}

function emptyForm(template?: CatalogTemplate | null): FormState {
  return {
    templateId: template?.id ?? "",
    classStart: "",
    classEnd: "",
    enrollmentStart: todayIsoDate(),
    enrollmentClose: "",
    price: template?.price ?? "",
    registrationFee: template?.registrationFee ?? "",
    certificationLength: template?.certificationLength ?? "",
    registrationLimit: template?.registrationLimit ?? "",
    classFormat: template?.defaultClassFormat ?? "Hybrid",
    location: template?.defaultLocation ?? "—",
    chargeFullAmountAtRegistration: false,
  };
}

export function CreateClassModal({
  isOpen,
  onClose,
  template: lockedTemplate,
  existingClassCount,
  onCreated,
}: CreateClassModalProps) {
  const locked = Boolean(lockedTemplate);
  const [form, setForm] = useState<FormState>(() => emptyForm(lockedTemplate));
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const selectedTemplate = lockedTemplate ?? CATALOG_TEMPLATES[form.templateId] ?? null;
  const online = isCatalogClassOnline(form.classFormat);
  const isCourse = selectedTemplate?.kind === "Course";

  useEffect(() => {
    if (!isOpen) return;
    setForm(emptyForm(lockedTemplate));
    setError(null);
  }, [isOpen, lockedTemplate]);

  function patch(next: Partial<FormState>) {
    setForm((prev) => {
      const merged = { ...prev, ...next };
      if (next.classStart !== undefined && next.classStart) {
        const autoClose = subtractIsoDays(next.classStart, 21);
        if (autoClose && (!prev.enrollmentClose || prev.enrollmentClose === subtractIsoDays(prev.classStart, 21))) {
          merged.enrollmentClose = autoClose;
        }
      }
      return merged;
    });
  }

  function handleTemplateChange(template: CatalogTemplate) {
    setForm((prev) => ({
      ...prev,
      templateId: template.id,
      ...inheritFromTemplate(template),
    }));
  }

  async function handleSubmit() {
    if (!selectedTemplate) {
      setError("Choose a program or course");
      return;
    }
    if (!online && (!form.classStart || !form.classEnd)) {
      setError("Class start and class end are required");
      return;
    }

    const count = existingClassCount ?? classesForTemplate(selectedTemplate.code).length;
    const classCode = nextClassCode(selectedTemplate.code, count);
    const empty = (value: string) => (!value || value === "—" ? null : value);
    const createdBase: Omit<ClassDetail, "id"> & { id?: string } = {
      classCode,
      courseCode: selectedTemplate.code,
      title: selectedTemplate.name,
      publishStatus: "draft",
      classFormat: form.classFormat,
      location: isClassOnline(form.classFormat) ? "—" : form.location || "—",
      enrollmentStart: online ? "" : form.enrollmentStart,
      enrollmentClose: online ? "" : form.enrollmentClose,
      classStart: online ? "" : form.classStart,
      classEnd: online ? "" : form.classEnd,
      classLength: selectedTemplate.classLength,
      registrationLimit: online ? "—" : form.registrationLimit,
      certificationLength: form.certificationLength,
      price: form.price,
      registrationFee: isCourse ? selectedTemplate.registrationFee : form.registrationFee,
      chargeFullAmountAtRegistration: form.chargeFullAmountAtRegistration,
      prerequisites: [...selectedTemplate.prerequisites],
      externalLinks: [],
      template: {
        kind: selectedTemplate.kind,
        name: selectedTemplate.name,
        href: catalogTemplateHref(selectedTemplate),
      },
    };

    if (isUuid(selectedTemplate.id)) {
      setCreating(true);
      const result = await createClass(
        selectedTemplate.id,
        selectedTemplate.name,
        selectedTemplate.code,
        classCode,
        online ? null : empty(form.enrollmentStart),
        online ? null : empty(form.enrollmentClose),
        online ? null : empty(form.classStart),
        online ? null : empty(form.classEnd),
        isClassOnline(form.classFormat),
        form.classFormat,
        null,
        empty(selectedTemplate.classLength),
        parseLeadingInt(form.certificationLength),
        online ? null : parseLeadingInt(form.registrationLimit),
        parseDisplayCents(form.price),
        parseDisplayCents(isCourse ? selectedTemplate.registrationFee : form.registrationFee),
        selectedTemplate.stripeProductId ?? null,
        isClassOnline(form.classFormat) ? null : empty(form.location),
        null,
        form.chargeFullAmountAtRegistration,
      );
      setCreating(false);
      if (!result.success || !result.class) {
        setError(result.error || "Failed to create class");
        return;
      }
      const created: ClassDetail = {
        ...createdBase,
        id: result.class.id,
        classCode: result.class.class_id || classCode,
        chargeFullAmountAtRegistration:
          result.class.charge_full_amount_at_registration === true,
      };
      registerCreatedClass(created);
      onCreated(created);
      toast.success(`${created.title} created`);
      onClose();
      return;
    }

    const created: ClassDetail = {
      ...createdBase,
      id: `created-${selectedTemplate.id}-${Date.now()}`,
    };

    registerCreatedClass(created);
    onCreated(created);
    toast.success(`${created.title} created — demo mode, saved locally only`);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Class"
      width={520}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button
            label={creating ? "Creating…" : "Create"}
            variant="primary"
            onClick={() => void handleSubmit()}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {locked && selectedTemplate ? (
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={fieldLabelStyle}>{selectedTemplate.kind}</span>
            <Text>{selectedTemplate.name}</Text>
          </label>
        ) : (
          <CatalogTemplateTypeahead value={selectedTemplate} onChange={handleTemplateChange} />
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Class type</span>
          <select
            value={form.classFormat}
            onChange={(event) =>
              patch({ classFormat: event.target.value as CatalogClassType })
            }
            style={selectStyle}
            aria-label="Class type"
          >
            {CATALOG_CLASS_TYPES.map((classType) => (
              <option key={classType} value={classType}>
                {classType}
              </option>
            ))}
          </select>
        </label>

        {!online ? (
          <Grid columns={2} gap={4}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Class start</span>
              <input
                type="date"
                value={form.classStart}
                onChange={(event) => patch({ classStart: event.target.value })}
                style={selectStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Class end</span>
              <input
                type="date"
                value={form.classEnd}
                onChange={(event) => patch({ classEnd: event.target.value })}
                style={selectStyle}
              />
            </label>
          </Grid>
        ) : null}

        <AccordionSection title="Registration information">
          {!online ? (
            <Grid columns={2} gap={4}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={fieldLabelStyle}>Registration start</span>
                <input
                  type="date"
                  value={form.enrollmentStart}
                  onChange={(event) => patch({ enrollmentStart: event.target.value })}
                  style={selectStyle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={fieldLabelStyle}>Registration end</span>
                <input
                  type="date"
                  value={form.enrollmentClose}
                  onChange={(event) => patch({ enrollmentClose: event.target.value })}
                  style={selectStyle}
                />
              </label>
            </Grid>
          ) : null}
          <Grid columns={2} gap={4}>
            <TextInput label="Tuition ($)" value={form.price} onChange={(price) => patch({ price })} />
            {!isCourse ? (
              <TextInput
                label="Registration fee ($)"
                value={form.registrationFee}
                onChange={(registrationFee) => patch({ registrationFee })}
              />
            ) : (
              <TextInput
                label="Certification length"
                value={form.certificationLength}
                onChange={(certificationLength) => patch({ certificationLength })}
              />
            )}
          </Grid>
          <Grid columns={2} gap={4}>
            {!isCourse ? (
              <TextInput
                label="Certification length"
                value={form.certificationLength}
                onChange={(certificationLength) => patch({ certificationLength })}
              />
            ) : null}
            {!online ? (
              <TextInput
                label="Registration limit"
                value={form.registrationLimit}
                onChange={(registrationLimit) => patch({ registrationLimit })}
              />
            ) : null}
            {!online ? (
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={fieldLabelStyle}>Location</span>
                <LocationSelect
                  value={form.location}
                  onChange={(location) => patch({ location })}
                  style={selectStyle}
                />
              </label>
            ) : null}
          </Grid>
          <Checkbox
            label="Charge full amount (registration fee + tuition) at registration"
            value={form.chargeFullAmountAtRegistration}
            onChange={(chargeFullAmountAtRegistration) =>
              patch({ chargeFullAmountAtRegistration })
            }
          />
        </AccordionSection>

        {error ? (
          <Text size="sm" style={{ color: "#eb5757" }}>
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}
