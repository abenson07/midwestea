"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { useBusinesses, useDemoGuard, usePeople } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import type { VolunteerAskWithSignups } from "hooks";
import type { DemoVolunteerAsk } from "@/data/mocks/events";

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

export type AddEventTaskModalProps = {
  isOpen: boolean;
  eventTitle: string;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    dueDate: string;
    addToFuturePlans: boolean;
  }) => Promise<void>;
};

export function AddEventTaskModal({
  isOpen,
  eventTitle,
  onClose,
  onSubmit,
}: AddEventTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [addToFuturePlans, setAddToFuturePlans] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setDescription("");
    setDueDate("");
    setAddToFuturePlans(true);
    setError(null);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add task"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={busy ? "Adding…" : "Add task"}
            variant="primary"
            disabled={busy || !title.trim() || !dueDate}
            onClick={() => {
              void (async () => {
                setBusy(true);
                setError(null);
                try {
                  await onSubmit({
                    title: title.trim(),
                    description: description.trim(),
                    dueDate,
                    addToFuturePlans,
                  });
                  onClose();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                } finally {
                  setBusy(false);
                }
              })();
            }}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextInput label="Task name" value={title} onChange={setTitle} />
        <TextInput label="Description" value={description} onChange={setDescription} />
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Due date</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={selectStyle} />
        </label>
        <Checkbox
          label={`Add to future ${eventTitle} plans`}
          value={addToFuturePlans}
          onChange={setAddToFuturePlans}
        />
        {error ? <Text size="sm" color="accent">{error}</Text> : null}
      </div>
    </Modal>
  );
}

export type AssignVolunteerModalProps = {
  isOpen: boolean;
  asks: Array<VolunteerAskWithSignups | DemoVolunteerAsk>;
  onClose: () => void;
  onSubmit: (payload: {
    personId: string | null;
    name: string;
    email: string;
    askIds: string[];
    createPerson: boolean;
  }) => Promise<void>;
};

export function AssignVolunteerModal({ isOpen, asks, onClose, onSubmit }: AssignVolunteerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createPerson, setCreatePerson] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [askIds, setAskIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { people, loading } = usePeople({
    autoFetch: isOpen && search.trim().length > 0 && !createPerson,
    filters: { search: search.trim() || undefined },
  });

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setSelectedId(null);
    setCreatePerson(false);
    setName("");
    setEmail("");
    setAskIds([]);
    setError(null);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add volunteer"
      width={480}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={busy ? "Adding…" : "Add volunteer"}
            variant="primary"
            disabled={busy || (!selectedId && !(createPerson && name.trim() && email.trim()))}
            onClick={() => {
              void (async () => {
                setBusy(true);
                setError(null);
                try {
                  await onSubmit({
                    personId: selectedId,
                    name: name.trim(),
                    email: email.trim(),
                    askIds,
                    createPerson,
                  });
                  onClose();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                } finally {
                  setBusy(false);
                }
              })();
            }}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!createPerson ? (
          <>
            <TextInput label="Search people" value={search} onChange={setSearch} />
            {loading ? <Text size="sm" color="secondary">Searching…</Text> : null}
            {people.slice(0, 8).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedId(p.id);
                  setName(p.full_name);
                  setEmail(p.email ?? "");
                }}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 6,
                  background:
                    selectedId === p.id
                      ? "var(--linear-color-sidebar-item-selected)"
                      : "transparent",
                }}
              >
                <Text weight="medium">{p.full_name}</Text>
                {p.email ? (
                  <Text size="sm" color="secondary">
                    {" "}
                    · {p.email}
                  </Text>
                ) : null}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCreatePerson(true);
                setSelectedId(null);
                if (search.includes("@")) setEmail(search);
                else setName(search);
              }}
              style={{ all: "unset", cursor: "pointer", color: "var(--linear-color-accent)", fontSize: 13 }}
            >
              Add name/email to the database
            </button>
          </>
        ) : (
          <>
            <TextInput label="Name" value={name} onChange={setName} />
            <TextInput label="Email" value={email} onChange={setEmail} />
          </>
        )}
        {asks.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Text size="sm" weight="medium">
              Assign to asks
            </Text>
            {asks.map((ask) => (
              <Checkbox
                key={ask.id}
                label={`${ask.title} (${ask.signup_count ?? ask.signups?.length ?? 0}/${ask.quantity})`}
                value={askIds.includes(ask.id)}
                onChange={(checked) =>
                  setAskIds((prev) =>
                    checked ? [...prev, ask.id] : prev.filter((id) => id !== ask.id),
                  )
                }
              />
            ))}
          </div>
        ) : null}
        {error ? <Text size="sm" color="accent">{error}</Text> : null}
      </div>
    </Modal>
  );
}

export type AddSponsorModalProps = {
  isOpen: boolean;
  levels: Array<{ id: string; name: string; price?: string }>;
  onClose: () => void;
  onSubmit: (payload: {
    businessId: string | null;
    businessName: string;
    levelId: string;
    alreadyPaid: boolean;
    inKind: boolean;
    donationAmount: string;
  }) => Promise<void>;
};

export function AddSponsorModal({ isOpen, levels, onClose, onSubmit }: AddSponsorModalProps) {
  const { businesses } = useBusinesses({ autoFetch: isOpen });
  const [search, setSearch] = useState("");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [levelId, setLevelId] = useState("");
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [inKind, setInKind] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return (businesses ?? []).slice(0, 8);
    return (businesses ?? [])
      .filter((b) => (b.business_name ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [businesses, search]);

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setBusinessId(null);
    setBusinessName("");
    setLevelId(levels[0]?.id ?? "");
    setAlreadyPaid(false);
    setInKind(false);
    setDonationAmount("");
    setError(null);
  }, [isOpen, levels]);

  const primaryLabel = inKind
    ? "Add donation"
    : alreadyPaid
      ? "Add sponsor"
      : "Send invoice";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add sponsor"
      width={480}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={busy ? "Working…" : primaryLabel}
            variant="primary"
            disabled={busy || !businessName.trim() || (!inKind && !levelId)}
            onClick={() => {
              void (async () => {
                setBusy(true);
                setError(null);
                try {
                  await onSubmit({
                    businessId,
                    businessName: businessName.trim(),
                    levelId,
                    alreadyPaid,
                    inKind,
                    donationAmount,
                  });
                  onClose();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                } finally {
                  setBusy(false);
                }
              })();
            }}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextInput label="Search businesses" value={search} onChange={setSearch} />
        {matches.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setBusinessId(b.id);
              setBusinessName(b.business_name ?? "");
              setSearch(b.business_name ?? "");
            }}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: 8,
              borderRadius: 6,
              background:
                businessId === b.id ? "var(--linear-color-sidebar-item-selected)" : "transparent",
            }}
          >
            <Text>{b.business_name}</Text>
          </button>
        ))}
        <Checkbox
          label="This is an in-kind donation."
          value={inKind}
          onChange={(v) => {
            setInKind(v);
            if (v) setAlreadyPaid(false);
          }}
        />
        {inKind ? (
          <TextInput label="Donation amount ($)" value={donationAmount} onChange={setDonationAmount} />
        ) : (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                Sponsorship level
              </span>
              <select style={selectStyle} value={levelId} onChange={(e) => setLevelId(e.target.value)}>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {l.price ? ` — ${l.price}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <Checkbox
              label="Already paid by cash or check"
              value={alreadyPaid}
              onChange={setAlreadyPaid}
            />
            {alreadyPaid ? (
              <Text size="sm" color="secondary">
                This option will not create an invoice for this sponsor.
              </Text>
            ) : null}
          </>
        )}
        {error ? <Text size="sm" color="accent">{error}</Text> : null}
      </div>
    </Modal>
  );
}

export type EventCreateInvoiceModalProps = {
  isOpen: boolean;
  eventId: string;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function EventCreateInvoiceModal({
  isOpen,
  eventId,
  onClose,
  onCreated,
}: EventCreateInvoiceModalProps) {
  const { enabled: demo, sendDemoEmail } = useDemoGuard();
  const { businesses } = useBusinesses({ autoFetch: isOpen });
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return (businesses ?? []).slice(0, 6);
    return (businesses ?? [])
      .filter((b) => (b.business_name ?? "").toLowerCase().includes(q))
      .slice(0, 6);
  }, [businesses, search]);

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setEmail("");
    setName("");
    setAmount("");
    setError(null);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create invoice"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={busy ? "Sending…" : "Send invoice"}
            variant="primary"
            disabled={busy}
            onClick={() => {
              void (async () => {
                const cents = Math.round(parseFloat(amount) * 100);
                if (!email.trim() || !Number.isFinite(cents) || cents <= 0) {
                  setError("Business email and amount are required.");
                  return;
                }
                setBusy(true);
                setError(null);
                try {
                  if (demo) {
                    await sendDemoEmail({
                      subject: `Invoice — ${name || "Event"}`,
                      text: `Invoice for $${amount} to ${email}`,
                      context: email,
                    });
                  } else {
                    const res = await fetch(`${getApiBase()}/api/stripe/invoices`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: email.trim(),
                        name: name.trim() || undefined,
                        amount_cents: cents,
                        description: "Event invoice",
                        event_id: eventId,
                      }),
                    });
                    const body = (await res.json()) as { error?: string };
                    if (!res.ok) throw new Error(body.error ?? "Failed");
                  }
                  await onCreated();
                  onClose();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                } finally {
                  setBusy(false);
                }
              })();
            }}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: "var(--linear-color-sidebar-item-selected)",
            fontSize: 13,
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          This is for invoicing someone associated with the event — not for adding a new
          sponsor. Use Sponsors to add sponsorships.
        </div>
        <TextInput label="Search businesses" value={search} onChange={setSearch} />
        {matches.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setName(b.business_name ?? "");
              setEmail(b.email ?? "");
              setSearch(b.business_name ?? "");
            }}
            style={{ all: "unset", cursor: "pointer", padding: 6 }}
          >
            <Text>{b.business_name}</Text>
          </button>
        ))}
        <TextInput label="Name" value={name} onChange={setName} />
        <TextInput label="Email" value={email} onChange={setEmail} />
        <TextInput label="Amount ($)" value={amount} onChange={setAmount} />
        {error ? <Text size="sm" color="accent">{error}</Text> : null}
      </div>
    </Modal>
  );
}

export type EditBudgetAmountModalProps = {
  isOpen: boolean;
  currentCents: number;
  onClose: () => void;
  onSubmit: (goalCents: number) => Promise<void>;
};

export function EditBudgetAmountModal({
  isOpen,
  currentCents,
  onClose,
  onSubmit,
}: EditBudgetAmountModalProps) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAmount((currentCents / 100).toFixed(0));
  }, [isOpen, currentCents]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit budget amount"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={busy ? "Saving…" : "Save"}
            variant="primary"
            disabled={busy}
            onClick={() => {
              void (async () => {
                const cents = Math.round(parseFloat(amount) * 100);
                if (!Number.isFinite(cents) || cents < 0) return;
                setBusy(true);
                try {
                  await onSubmit(cents);
                  onClose();
                } finally {
                  setBusy(false);
                }
              })();
            }}
          />
        </>
      }
    >
      <TextInput label="Sponsorship goal ($)" value={amount} onChange={setAmount} />
    </Modal>
  );
}

export type VolunteerReminderModalProps = {
  isOpen: boolean;
  daysUntil: number;
  recipientCount: number;
  onClose: () => void;
  onSend: (payload: { subject: string; text: string }) => Promise<void>;
};

export function VolunteerReminderModal({
  isOpen,
  daysUntil,
  recipientCount,
  onClose,
  onSend,
}: VolunteerReminderModalProps) {
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSubject("Event reminder — Maple Leaf Community Council");
    setText(
      `Hi,\n\nThis is a reminder about the upcoming event${
        daysUntil >= 0 ? ` in ${daysUntil} day${daysUntil === 1 ? "" : "s"}` : ""
      }.\n\nThanks,\nMLCC`,
    );
  }, [isOpen, daysUntil]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email volunteers"
      width={480}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={busy ? "Sending…" : `Send to ${recipientCount}`}
            variant="primary"
            disabled={busy || recipientCount === 0}
            onClick={() => {
              void (async () => {
                setBusy(true);
                try {
                  await onSend({ subject, text });
                  onClose();
                } finally {
                  setBusy(false);
                }
              })();
            }}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextInput label="Subject" value={subject} onChange={setSubject} />
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Message</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            style={{ ...selectStyle, height: "auto", paddingBlock: 8, resize: "vertical" }}
          />
        </label>
      </div>
    </Modal>
  );
}
