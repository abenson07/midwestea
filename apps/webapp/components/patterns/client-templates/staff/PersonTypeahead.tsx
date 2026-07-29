"use client";

import { useMemo, useState } from "react";
import { UserPlus, Search } from "lucide-react";
import { Popover } from "@/components/patterns/primitives/Popover";
import { ListItem } from "@/components/patterns/primitives/List";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { staffDirectory, type DirectoryPerson } from "@/data/mocks/staff";

export type PersonTypeaheadProps = {
  value: DirectoryPerson | null;
  onChange: (person: DirectoryPerson) => void;
};

/** Search-for-a-person or add-by-email input, used in the "+ Add staff" modal. */
export function PersonTypeahead({ value, onChange }: PersonTypeaheadProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staffDirectory;
    return staffDirectory.filter(
      (person) =>
        person.name.toLowerCase().includes(q) || person.email.toLowerCase().includes(q),
    );
  }, [query]);

  const trimmedQuery = query.trim();
  const looksLikeEmail = trimmedQuery.includes("@");
  const hasExactMatch = results.some(
    (person) => person.email.toLowerCase() === trimmedQuery.toLowerCase(),
  );

  function select(person: DirectoryPerson) {
    onChange(person);
    setQuery(person.name);
    setIsOpen(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
        Person
      </span>
      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width="100%"
        content={
          <div
            style={{
              boxSizing: "border-box",
              background: "var(--linear-color-canvas)",
              border: "var(--linear-border-width) solid var(--linear-color-hairline)",
              borderRadius: "var(--linear-radius-md)",
              boxShadow: "var(--linear-shadow-canvas)",
              padding: 4,
              maxHeight: 220,
              overflow: "auto",
            }}
          >
            {results.map((person) => (
              <ListItem
                key={person.email}
                label={`${person.name} · ${person.email}`}
                startContent={<Avatar name={person.name} size="sm" />}
                onClick={() => select(person)}
              />
            ))}
            {looksLikeEmail && !hasExactMatch ? (
              <ListItem
                label={`Add "${trimmedQuery}"`}
                startContent={<UserPlus size={16} strokeWidth={1.75} />}
                onClick={() =>
                  select({ name: trimmedQuery.split("@")[0], email: trimmedQuery })
                }
              />
            ) : null}
            {results.length === 0 && !looksLikeEmail ? (
              <div style={{ padding: 8 }}>
                <Text size="sm" color="secondary">
                  No matches — try an email address.
                </Text>
              </div>
            ) : null}
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <span style={{ position: "relative", flex: 1 }}>
            <span
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                display: "inline-flex",
                color: "var(--linear-color-ink-subtle)",
                pointerEvents: "none",
              }}
            >
              <Search size={14} strokeWidth={1.75} />
            </span>
            <input
              type="text"
              value={query}
              placeholder="Search by name or email…"
              onFocus={() => setIsOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsOpen(true);
              }}
              style={{
                boxSizing: "border-box",
                width: "100%",
                height: 32,
                paddingInline: "28px 8px",
                borderRadius: 6,
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                background: "var(--linear-color-canvas)",
                color: "var(--linear-color-ink)",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            />
          </span>
        </div>
      </Popover>
      {value ? (
        <Text size="sm" color="secondary">
          Selected: {value.name} ({value.email})
        </Text>
      ) : null}
    </div>
  );
}
