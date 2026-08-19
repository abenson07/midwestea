"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Card } from "@/components/admin-migrate/patterns/primitives/Card";
import { Heading, Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { VStack } from "@/components/admin-migrate/patterns/primitives/Stack";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { getDemoEntity, upsertDemoEntity } from "@/lib/demo/demoStore";
import { SettingsRow } from "./SettingsRow";

const rowInputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: 260,
  height: 30,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
  textAlign: "right",
};

function Divider() {
  return <div style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }} />;
}

const DEMO_NAME = "Kyle Brower";
const DEMO_EMAIL = "kyle.brower@example.com";
const DEMO_PHONE = "(555) 123-4567";

export function ProfilePanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const profile = getDemoEntity<{ id: string; name?: string; email?: string; phone?: string }>(
      "accountSettings",
      "profile",
    );
    setName(profile?.name ?? DEMO_NAME);
    setEmail(profile?.email ?? DEMO_EMAIL);
    setPhone(profile?.phone ?? DEMO_PHONE);
  }, []);

  function handleSave() {
    setSaving(true);
    upsertDemoEntity("accountSettings", {
      id: "profile",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    toast.success("Saved — demo mode, saved locally only");
    setSaving(false);
  }

  return (
    <VStack gap={6}>
      <Heading level={1}>Profile</Heading>
      <VStack gap={3}>
        <Text type="label" color="secondary">
          Details
        </Text>
        <Card padding={4}>
          <VStack gap={4}>
            <SettingsRow
              label="Name"
              description="Your first and last name"
              control={
                <input
                  style={rowInputStyle}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              }
            />
            <Divider />
            <SettingsRow
              label="Email address"
              control={
                <input
                  type="email"
                  style={rowInputStyle}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              }
            />
            <Divider />
            <SettingsRow
              label="Phone number"
              control={
                <input
                  type="tel"
                  style={rowInputStyle}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              }
            />
          </VStack>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button
              label={saving ? "Saving…" : "Save"}
              variant="primary"
              onClick={handleSave}
              disabled={saving || !name.trim()}
            />
          </div>
        </Card>
      </VStack>
    </VStack>
  );
}
