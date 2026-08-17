"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useBusinesses, usePeople, type BusinessWithDetails, type PersonWithMembership } from "hooks";
import { MobilePersonSheet, MobileBusinessSheet } from "./MobileDetailSheets";
import { MobileQuickAddPerson } from "./MobileQuickActions";
import {
  mobileEmptyStyle,
  mobileFabStyle,
  mobileHeaderStyle,
  mobileListRowStyle,
  mobilePageStyle,
  mobileScrollStyle,
  mobileSearchInputStyle,
  mobileTitleStyle,
} from "./mobileStyles";

type DatabaseTab = "people" | "neighbors" | "volunteers" | "businesses";

const TABS: { id: DatabaseTab; label: string }[] = [
  { id: "people", label: "People" },
  { id: "neighbors", label: "Neighbors" },
  { id: "volunteers", label: "Volunteers" },
  { id: "businesses", label: "Businesses" },
];

function isDatabaseTab(value: string | null): value is DatabaseTab {
  return (
    value === "people" ||
    value === "neighbors" ||
    value === "volunteers" ||
    value === "businesses"
  );
}

export function MobileDatabasePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const initialId = searchParams.get("id");

  const [tab, setTab] = useState<DatabaseTab>(isDatabaseTab(initialTab) ? initialTab : "people");
  const [search, setSearch] = useState("");
  const [membersOnly, setMembersOnly] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithMembership | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithDetails | null>(null);

  const peopleFilters = useMemo(() => {
    const filters: {
      search?: string;
      hasMembership?: boolean;
      role?: string;
    } = {};
    if (search.trim()) filters.search = search.trim();
    if (membersOnly) filters.hasMembership = true;
    if (tab === "volunteers") filters.role = "volunteer";
    return filters;
  }, [search, membersOnly, tab]);

  const peopleEnabled = tab !== "businesses";
  const { people, loading: peopleLoading, error: peopleError, refetch } = usePeople({
    autoFetch: peopleEnabled,
    filters: peopleFilters,
  });

  const { businesses, loading: bizLoading, error: bizError } = useBusinesses({
    autoFetch: tab === "businesses",
    filters: {
      search: search.trim() || undefined,
      isMember: membersOnly ? true : undefined,
    },
  });

  useEffect(() => {
    if (!initialId) return;
    if (tab === "businesses") {
      const match = businesses.find((b) => b.id === initialId);
      if (match) setSelectedBusiness(match);
      return;
    }
    const match = people.find((p) => p.id === initialId);
    if (match) setSelectedPerson(match);
  }, [initialId, tab, people, businesses]);

  useEffect(() => {
    if (!selectedPerson) return;
    const fresh = people.find((p) => p.id === selectedPerson.id);
    if (fresh && fresh !== selectedPerson) setSelectedPerson(fresh);
  }, [people, selectedPerson]);

  const listPeople =
    tab === "neighbors"
      ? people.filter((p) => !p.membership_id)
      : people;

  return (
    <div style={{ ...mobilePageStyle, position: "relative" }}>
      <header style={mobileHeaderStyle}>
        <h1 style={mobileTitleStyle}>Database</h1>
        <div style={{ marginTop: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search names…"
            style={mobileSearchInputStyle}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 12,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TABS.map((t) => {
            const selected = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setSelectedPerson(null);
                  setSelectedBusiness(null);
                }}
                style={{
                  flexShrink: 0,
                  height: 32,
                  paddingInline: 12,
                  borderRadius: 999,
                  border: selected
                    ? "none"
                    : "var(--linear-border-width) solid var(--linear-color-hairline)",
                  background: selected ? "var(--linear-color-accent)" : "transparent",
                  color: selected
                    ? "var(--linear-color-accent-ink)"
                    : "var(--linear-color-ink-subtle)",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            fontSize: 13,
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          <input
            type="checkbox"
            checked={membersOnly}
            onChange={(e) => setMembersOnly(e.target.checked)}
          />
          Members only
        </label>
      </header>

      <div style={mobileScrollStyle}>
        {tab === "businesses" ? (
          bizError ? (
            <div style={mobileEmptyStyle}>{bizError}</div>
          ) : bizLoading ? (
            <div style={mobileEmptyStyle}>Loading…</div>
          ) : businesses.length === 0 ? (
            <div style={mobileEmptyStyle}>No businesses</div>
          ) : (
            businesses.map((b) => (
              <button
                key={b.id}
                type="button"
                style={mobileListRowStyle}
                onClick={() => setSelectedBusiness(b)}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>
                    {b.business_name ?? "Untitled business"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                    {b.contact_name ?? b.email ?? "—"}
                    {b.is_member ? " · Member" : ""}
                  </div>
                </div>
              </button>
            ))
          )
        ) : peopleError ? (
          <div style={mobileEmptyStyle}>{peopleError}</div>
        ) : peopleLoading ? (
          <div style={mobileEmptyStyle}>Loading…</div>
        ) : listPeople.length === 0 ? (
          <div style={mobileEmptyStyle}>No people</div>
        ) : (
          listPeople.map((p) => (
            <button
              key={p.id}
              type="button"
              style={mobileListRowStyle}
              onClick={() => setSelectedPerson(p)}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{p.full_name}</div>
                <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                  {p.email ?? p.phone ?? "—"}
                  {p.membership_id ? " · Member" : ""}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {tab !== "businesses" ? (
        <button type="button" style={mobileFabStyle} onClick={() => setAddOpen(true)}>
          <Plus size={18} strokeWidth={2} />
          Add
        </button>
      ) : null}

      <MobilePersonSheet
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onRefetch={async () => {
          await refetch();
        }}
      />
      <MobileBusinessSheet
        business={selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
      />
      <MobileQuickAddPerson
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={async () => {
          await refetch();
        }}
      />
    </div>
  );
}
