"use client";

import { Card } from "@/components/admin-migrate/patterns/primitives/Card";
import { Heading, Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { VStack } from "@/components/admin-migrate/patterns/primitives/Stack";
import { useCurrentAdmin } from "@/lib/admin-migrate/useCurrentAdmin";
import { useCurrentAdminEmail } from "@/lib/admin-migrate/useCurrentAdminEmail";
import { SettingsRow } from "./SettingsRow";

function Divider() {
  return <div style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }} />;
}

export function ProfilePanel() {
  const { admin, loading: loadingAdmin } = useCurrentAdmin();
  const { email, loading: loadingEmail } = useCurrentAdminEmail();

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
              control={<Text color="secondary">{loadingAdmin ? "Loading…" : admin?.display_name || "—"}</Text>}
            />
            <Divider />
            <SettingsRow
              label="Email address"
              control={<Text color="secondary">{loadingEmail ? "Loading…" : email || "—"}</Text>}
            />
          </VStack>
        </Card>
        <Text color="secondary" size="sm">
          To update this information, contact your administrator.
        </Text>
      </VStack>
    </VStack>
  );
}
