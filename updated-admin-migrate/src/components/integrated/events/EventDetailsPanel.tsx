"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Plus, X, ImageIcon } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Modal } from "@/components/patterns/shared/Modal";
import { SettingsRow } from "@/components/patterns/client-templates-migrate/settings/SettingsRow";
import { eventsListBasePath, type EventDocumentAsset } from "@/lib/events/eventData";
import { eventPageUrl } from "@/lib/events/eventQr";
import { getApiBase } from "@/lib/apiBase";
import { useEventContext } from "./EventContext";
import { EventQrCodesSection } from "./EventQrCodesSection";

function Divider() {
  return (
    <div
      style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }}
    />
  );
}

const rowInputStyle = {
  boxSizing: "border-box" as const,
  width: 260,
  height: 30,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
  textAlign: "right" as const,
};

const DEFAULT_DOCUMENTS: EventDocumentAsset[] = [
  { id: "doc-poster", label: "Poster" },
  { id: "doc-social-square", label: "Social — square" },
  { id: "doc-social-story", label: "Social — story" },
];

const DEFAULT_DOCUMENT_IDS = new Set(DEFAULT_DOCUMENTS.map((d) => d.id));

const docThumbStyle = {
  boxSizing: "border-box" as const,
  width: 40,
  height: 40,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-icon-button-secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  overflow: "hidden" as const,
};

function toDatePart(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimePart(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateTime(date: string, time: string): string | null {
  if (!date.trim()) return null;
  const t = time.trim() || "00:00";
  const d = new Date(`${date}T${t}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

type PlaceSuggest = { placeId: string; mainText: string; secondaryText: string };

function useDebouncedCallback<T extends unknown[]>(fn: (...args: T) => void, delay: number) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );
}

function EventLocationPicker({
  location,
  address,
  isGeneric,
  disabled,
  onPickPlace,
  onGenericName,
  onAddressChange,
}: {
  location: string;
  address: string;
  isGeneric: boolean;
  disabled?: boolean;
  onPickPlace: (name: string, address: string) => void;
  onGenericName: (name: string) => void;
  onAddressChange: (address: string) => void;
}) {
  const listId = useId();
  const sessionTokenRef = useRef(crypto.randomUUID());
  /** Skip autocomplete reopen after a pick / generic commit updates `query`. */
  const suppressSearchRef = useRef(false);
  const searchGenRef = useRef(0);
  const [editing, setEditing] = useState(!location.trim());
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggest[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!location.trim()) {
      setEditing(true);
      return;
    }
    setEditing(false);
  }, [location]);

  const runAutocomplete = useDebouncedCallback(async (q: string) => {
    if (!editing) return;
    if (suppressSearchRef.current) {
      suppressSearchRef.current = false;
      return;
    }
    if (!q.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const gen = ++searchGenRef.current;
    try {
      const res = await fetch(`${getApiBase()}/api/places/autocomplete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: q, sessionToken: sessionTokenRef.current }),
      });
      const json = (await res.json()) as { suggestions?: PlaceSuggest[] };
      if (!res.ok || gen !== searchGenRef.current) return;
      setSuggestions(json.suggestions ?? []);
      setOpen((json.suggestions ?? []).length > 0);
    } catch {
      if (gen !== searchGenRef.current) return;
      setSuggestions([]);
    }
  }, 300);

  useEffect(() => {
    if (!editing) return;
    runAutocomplete(query);
  }, [query, runAutocomplete, editing]);

  function closeSuggestions() {
    suppressSearchRef.current = true;
    searchGenRef.current += 1;
    setSuggestions([]);
    setOpen(false);
  }

  function startEditing() {
    closeSuggestions();
    setQuery("");
    setEditing(true);
  }

  async function pick(s: PlaceSuggest) {
    closeSuggestions();
    try {
      const res = await fetch(`${getApiBase()}/api/places/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: s.placeId, sessionToken: sessionTokenRef.current }),
      });
      const json = (await res.json()) as {
        place?: { displayName: string; formattedAddress: string };
      };
      const name = json.place?.displayName || s.mainText;
      const addr = json.place?.formattedAddress || s.secondaryText || "";
      onPickPlace(name, addr);
      setEditing(false);
      setQuery("");
      sessionTokenRef.current = crypto.randomUUID();
    } catch {
      onPickPlace(s.mainText, s.secondaryText);
      setEditing(false);
      setQuery("");
    }
  }

  const changeLink = !disabled ? (
    <button
      type="button"
      onClick={startEditing}
      style={{
        all: "unset",
        cursor: "pointer",
        color: "var(--linear-color-accent)",
        fontSize: 13,
        fontWeight: 510,
        flexShrink: 0,
      }}
    >
      Change
    </button>
  ) : null;

  if (!editing && location.trim()) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          gap: 12,
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: 13,
              lineHeight: "18px",
              fontWeight: 510,
              color: "var(--linear-color-ink)",
            }}
          >
            {location}
          </span>
          {address.trim() ? (
            <span
              style={{
                fontSize: 12,
                lineHeight: "16px",
                color: "var(--linear-color-ink-subtle)",
              }}
            >
              {address}
            </span>
          ) : isGeneric ? (
            <input
              style={{ ...rowInputStyle, width: "100%", textAlign: "left", marginTop: 4 }}
              value={address}
              disabled={disabled}
              placeholder="Add address"
              onChange={(e) => onAddressChange(e.target.value)}
            />
          ) : null}
        </div>
        {changeLink}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 320, position: "relative" }}>
      <input
        type="search"
        value={query}
        disabled={disabled}
        placeholder="Search Google Places…"
        autoFocus={Boolean(location.trim())}
        style={{ ...rowInputStyle, width: "100%", textAlign: "left" }}
        aria-controls={listId}
        aria-expanded={open}
        onChange={(e) => {
          suppressSearchRef.current = false;
          setQuery(e.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 50,
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            minWidth: "100%",
            width: "max(100%, 320px)",
            margin: 0,
            padding: 4,
            listStyle: "none",
            background: "var(--linear-color-side-panel)",
            border: "var(--linear-border-width) solid var(--linear-color-canvas-border)",
            borderRadius: 8,
            boxShadow: "var(--linear-shadow-side-panel)",
            maxHeight: 240,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                role="option"
                style={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                  width: "100%",
                  margin: 0,
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: 6,
                  background: "transparent",
                  color: "var(--linear-color-ink)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  lineHeight: "18px",
                  textAlign: "left",
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void pick(s)}
              >
                <span style={{ fontWeight: 510, color: "var(--linear-color-ink)" }}>
                  {s.mainText}
                </span>
                {s.secondaryText ? (
                  <span
                    style={{
                      color: "var(--linear-color-ink-subtle)",
                      fontSize: 12,
                      lineHeight: "16px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {s.secondaryText}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
          {query.trim() ? (
            <li>
              <button
                type="button"
                style={{
                  boxSizing: "border-box",
                  display: "block",
                  width: "100%",
                  margin: 0,
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: 6,
                  background: "transparent",
                  color: "var(--linear-color-accent)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  lineHeight: "18px",
                  textAlign: "left",
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const name = query.trim();
                  closeSuggestions();
                  onGenericName(name);
                  setEditing(false);
                  setQuery("");
                }}
              >
                Use “{query.trim()}” as a generic name
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
      {location.trim() && !disabled ? (
        <button
          type="button"
          onClick={() => {
            closeSuggestions();
            setEditing(false);
            setQuery("");
          }}
          style={{
            all: "unset",
            cursor: "pointer",
            marginTop: 8,
            color: "var(--linear-color-ink-subtle)",
            fontSize: 12,
          }}
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
}


export default function EventDetailsPanel({
  topBanner,
}: {
  topBanner?: ReactNode;
}) {
  const pathname = usePathname();
  const {
    event,
    loading,
    readOnly,
    updateEvent,
    uploadCoverImage,
    publishEvent,
    unpublishEvent,
  } = useEventContext();

  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showEndTime, setShowEndTime] = useState(false);
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [locationIsGeneric, setLocationIsGeneric] = useState(false);
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<EventDocumentAsset[]>(DEFAULT_DOCUMENTS);
  const [initialized, setInitialized] = useState(false);
  const [baseline, setBaseline] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [coverHover, setCoverHover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);
  const [docUploadId, setDocUploadId] = useState<string | null>(null);

  const snapshot = useMemo(
    () =>
      JSON.stringify({
        name,
        eventDate,
        startTime,
        endTime,
        showEndTime,
        location,
        address,
        locationIsGeneric,
        description,
        documents,
      }),
    [
      name,
      eventDate,
      startTime,
      endTime,
      showEndTime,
      location,
      address,
      locationIsGeneric,
      description,
      documents,
    ],
  );

  const dirty = initialized && snapshot !== baseline;

  function hydrateFromEvent() {
    if (!event) return;
    const date = toDatePart(event.starts_at);
    const start = toTimePart(event.starts_at);
    const end = toTimePart(event.ends_at);
    const nextName = event.title;
    const nextShowEnd = Boolean(end && end !== start);
    const nextLocation = event.fieldData.location ?? "";
    const nextAddress = event.fieldData.address ?? "";
    const nextGeneric = Boolean(event.fieldData.location_is_generic);
    const nextDescription = event.fieldData.description ?? "";
    const docs = event.fieldData.documents;
    const nextDocs =
      docs && docs.length > 0
        ? docs.map((d) => ({ ...d }))
        : DEFAULT_DOCUMENTS.map((d) => ({ ...d }));

    setName(nextName);
    setEventDate(date);
    setStartTime(start);
    setEndTime(end);
    setShowEndTime(nextShowEnd);
    setLocation(nextLocation);
    setAddress(nextAddress);
    setLocationIsGeneric(nextGeneric);
    setDescription(nextDescription);
    setDocuments(nextDocs);
    setBaseline(
      JSON.stringify({
        name: nextName,
        eventDate: date,
        startTime: start,
        endTime: end,
        showEndTime: nextShowEnd,
        location: nextLocation,
        address: nextAddress,
        locationIsGeneric: nextGeneric,
        description: nextDescription,
        documents: nextDocs,
      }),
    );
    setInitialized(true);
  }

  useEffect(() => {
    if (!event) return;
    hydrateFromEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  if (loading && !event) {
    return <Text color="secondary">Loading event…</Text>;
  }

  if (!event) {
    return (
      <VStack gap={3}>
        <Heading level={2}>Event not found</Heading>
        <Link href={eventsListBasePath(pathname)} className="lf-link">
          Back to events
        </Link>
      </VStack>
    );
  }

  const fd = event.fieldData;
  const isPublished = event.publishStatus === "published";
  const publicUrl = eventPageUrl(event.slug);

  async function persistChanges() {
    if (readOnly || !event) return;
    setSaving(true);
    setError(null);
    try {
      const nextStarts = combineDateTime(eventDate, startTime);
      const nextEnds = showEndTime && endTime ? combineDateTime(eventDate, endTime) : null;
      await updateEvent({
        name: name.trim(),
        starts_at: nextStarts,
        ends_at: nextEnds,
        date: eventDate || null,
        field_data: {
          ...fd,
          location: location.trim(),
          address: address.trim() || undefined,
          location_is_generic: locationIsGeneric,
          description: description.trim(),
          documents,
          capacity: undefined,
        },
      });
      setBaseline(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
      setConfirmSave(false);
    }
  }

  function discardChanges() {
    if (!event) return;
    hydrateFromEvent();
    setBaseline(
      JSON.stringify({
        name: event.title,
        eventDate: toDatePart(event.starts_at),
        startTime: toTimePart(event.starts_at),
        endTime: toTimePart(event.ends_at),
        showEndTime: Boolean(toTimePart(event.ends_at)),
        location: event.fieldData.location ?? "",
        address: event.fieldData.address ?? "",
        locationIsGeneric: Boolean(event.fieldData.location_is_generic),
        description: event.fieldData.description ?? "",
        documents:
          event.fieldData.documents && event.fieldData.documents.length > 0
            ? event.fieldData.documents
            : DEFAULT_DOCUMENTS,
      }),
    );
    setConfirmDiscard(false);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || readOnly) return;
    setUploadingImage(true);
    setError(null);
    try {
      const url = await uploadCoverImage(file);
      await updateEvent({ field_data: { ...fd, image_url: url } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = docUploadId;
    if (!file || !id || readOnly) return;
    setUploadingImage(true);
    try {
      const url = await uploadCoverImage(file);
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, url } : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploadingImage(false);
      setDocUploadId(null);
      if (docFileRef.current) docFileRef.current.value = "";
    }
  }

  async function handleTogglePublish() {
    if (readOnly) return;
    setPublishing(true);
    setError(null);
    try {
      if (isPublished) await unpublishEvent();
      else await publishEvent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update publish status");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUpdateFieldData(next: Record<string, unknown>) {
    await updateEvent({ field_data: next });
  }

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "48px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 760, marginInline: "auto" }}>
        <VStack gap={8}>
          {topBanner}
          <Heading level={1}>Event settings</Heading>

          <VStack gap={3}>
            <Text type="label" color="secondary">
              Event details
            </Text>
            <Card padding={4}>
              <VStack gap={4}>
                <SettingsRow
                  label="Event name"
                  description="Shown on the event page"
                  control={
                    <input
                      style={rowInputStyle}
                      value={name}
                      disabled={readOnly}
                      onChange={(e) => setName(e.target.value)}
                    />
                  }
                />
                <Divider />
                <SettingsRow
                  label="Date"
                  description="Single-day events only"
                  control={
                    <input
                      type="date"
                      style={rowInputStyle}
                      value={eventDate}
                      disabled={readOnly}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  }
                />
                <Divider />
                <SettingsRow
                  label="Start time"
                  description="Local start time"
                  control={
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <input
                        type="time"
                        style={rowInputStyle}
                        value={startTime}
                        disabled={readOnly}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                      {!showEndTime && !readOnly ? (
                        <button
                          type="button"
                          onClick={() => setShowEndTime(true)}
                          style={{
                            all: "unset",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "var(--linear-color-accent)",
                          }}
                        >
                          Add end time
                        </button>
                      ) : null}
                    </div>
                  }
                />
                {showEndTime ? (
                  <>
                    <Divider />
                    <SettingsRow
                      label="End time"
                      description="Optional"
                      control={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="time"
                            style={rowInputStyle}
                            value={endTime}
                            disabled={readOnly}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                          {!readOnly ? (
                            <IconButton
                              label="Remove end time"
                              variant="ghost"
                              size="sm"
                              icon={<X size={14} strokeWidth={1.75} />}
                              onClick={() => {
                                setShowEndTime(false);
                                setEndTime("");
                              }}
                            />
                          ) : null}
                        </div>
                      }
                    />
                  </>
                ) : null}
                <Divider />
                <SettingsRow
                  label="Location"
                  description="Search Places or use a generic name"
                  control={
                    <EventLocationPicker
                      location={location}
                      address={address}
                      isGeneric={locationIsGeneric}
                      disabled={readOnly}
                      onPickPlace={(loc, addr) => {
                        setLocation(loc);
                        setAddress(addr);
                        setLocationIsGeneric(false);
                      }}
                      onGenericName={(loc) => {
                        setLocation(loc);
                        setLocationIsGeneric(true);
                      }}
                      onAddressChange={setAddress}
                    />
                  }
                />
              </VStack>
            </Card>
          </VStack>

          <VStack gap={3}>
            <Text type="label" color="secondary">
              Website details
            </Text>
            <Card padding={4}>
              <VStack gap={4}>
                <SettingsRow
                  label={isPublished ? "Status online" : "Status draft"}
                  description={
                    isPublished
                      ? "Public on the marketing site"
                      : "Not posted yet"
                  }
                  control={
                    <Button
                      label={
                        publishing
                          ? isPublished
                            ? "Unpublishing…"
                            : "Publishing…"
                          : isPublished
                            ? "Unpublish"
                            : "Publish"
                      }
                      variant={isPublished ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => {
                        if (!publishing && !readOnly) void handleTogglePublish();
                      }}
                    />
                  }
                />
                {isPublished && publicUrl ? (
                  <>
                    <Divider />
                    <SettingsRow
                      label="Public URL"
                      description="Live event page"
                      control={
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "var(--linear-color-accent)",
                            fontSize: 13,
                            textAlign: "right",
                            maxWidth: 280,
                          }}
                        >
                          /events/{event.slug}
                        </a>
                      }
                    />
                  </>
                ) : null}
                <Divider />
                <VStack gap={1.5}>
                  <VStack gap={0.5}>
                    <Text weight="medium" display="block">
                      Cover image
                    </Text>
                    <Text size="sm" color="secondary" display="block">
                      Main image for the event page
                    </Text>
                  </VStack>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      borderRadius: "var(--linear-radius-md)",
                      overflow: "hidden",
                      background: "var(--linear-color-icon-button-secondary)",
                      border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                    }}
                    onMouseEnter={() => setCoverHover(true)}
                    onMouseLeave={() => setCoverHover(false)}
                  >
                    {fd.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fd.image_url}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={readOnly || uploadingImage}
                      onChange={(e) => void handleImageChange(e)}
                    />
                    {!readOnly && (coverHover || !fd.image_url) ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          position: "absolute",
                          inset: 0,
                          border: "none",
                          background: "rgba(0,0,0,0.35)",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {uploadingImage ? "Uploading…" : "Change image"}
                      </button>
                    ) : null}
                  </div>
                </VStack>
                <Divider />
                <VStack gap={1.5}>
                  <VStack gap={0.5}>
                    <Text weight="medium" display="block">
                      Description
                    </Text>
                    <Text size="sm" color="secondary" display="block">
                      Promotional copy for the event page
                    </Text>
                  </VStack>
                  <textarea
                    value={description}
                    disabled={readOnly}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      boxSizing: "border-box",
                      width: "100%",
                      aspectRatio: "16 / 3",
                      resize: "none",
                      padding: 12,
                      borderRadius: "var(--linear-radius-md)",
                      border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                      background: "var(--linear-color-canvas)",
                      color: "var(--linear-color-ink)",
                      fontSize: 13,
                      fontFamily: "inherit",
                      lineHeight: 1.45,
                    }}
                  />
                </VStack>
              </VStack>
            </Card>
          </VStack>

          <EventQrCodesSection
            fieldData={fd}
            eventSlug={event.slug}
            eventName={event.title}
            readOnly={readOnly}
            onUpdateFieldData={handleUpdateFieldData}
          />

          <VStack gap={3}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Text type="label" color="secondary">
                Documents and materials
              </Text>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() =>
                    setDocuments((prev) => [
                      ...prev,
                      { id: `doc-${Date.now()}`, label: "Custom asset" },
                    ])
                  }
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    color: "var(--linear-color-accent)",
                  }}
                >
                  <Plus size={14} strokeWidth={1.75} />
                  Add row
                </button>
              ) : null}
            </div>
            <Card padding={4}>
              <VStack gap={3}>
                <input
                  ref={docFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => void handleDocUpload(e)}
                />
                {documents.map((doc) => {
                  const isDefault = DEFAULT_DOCUMENT_IDS.has(doc.id);
                  return (
                    <div
                      key={doc.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        paddingBlock: 4,
                      }}
                    >
                      <div style={docThumbStyle}>
                        {doc.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={doc.url}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <ImageIcon
                            size={18}
                            strokeWidth={1.75}
                            color="var(--linear-color-ink-subtle)"
                          />
                        )}
                      </div>
                      <Text weight="medium" display="block" style={{ flex: 1, minWidth: 0 }}>
                        {doc.label}
                      </Text>
                      <Text size="sm" color="secondary" style={{ minWidth: 72 }}>
                        {doc.url ? "Uploaded" : "Empty"}
                      </Text>
                      {!readOnly ? (
                        <>
                          <Button
                            label="Upload"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setDocUploadId(doc.id);
                              docFileRef.current?.click();
                            }}
                          />
                          {!isDefault ? (
                            <IconButton
                              label="Remove"
                              variant="ghost"
                              size="sm"
                              icon={<X size={14} strokeWidth={1.75} />}
                              onClick={() =>
                                setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
                              }
                            />
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </VStack>
            </Card>
          </VStack>

          {error ? <Text color="accent">{error}</Text> : null}

          {!readOnly ? (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button
                label="Cancel"
                variant="secondary"
                disabled={!dirty || saving}
                onClick={() => setConfirmDiscard(true)}
              />
              <Button
                label={saving ? "Saving…" : "Save changes"}
                variant="primary"
                disabled={!dirty || saving}
                onClick={() => setConfirmSave(true)}
              />
            </div>
          ) : null}
        </VStack>
      </div>

      <Modal
        isOpen={confirmSave}
        onClose={() => setConfirmSave(false)}
        title="Save changes?"
        footer={
          <>
            <Button label="Keep editing" variant="secondary" onClick={() => setConfirmSave(false)} />
            <Button
              label="Save"
              variant="primary"
              onClick={() => void persistChanges()}
            />
          </>
        }
      >
        <Text size="sm" color="secondary">
          This will update the event details and website fields.
        </Text>
      </Modal>

      <Modal
        isOpen={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="Discard changes?"
        footer={
          <>
            <Button label="Keep editing" variant="secondary" onClick={() => setConfirmDiscard(false)} />
            <Button label="Discard" variant="primary" onClick={discardChanges} />
          </>
        }
      >
        <Text size="sm" color="secondary">
          Unsaved edits will be lost.
        </Text>
      </Modal>
    </div>
  );
}
