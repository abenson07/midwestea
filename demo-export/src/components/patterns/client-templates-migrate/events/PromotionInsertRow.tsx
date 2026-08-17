"use client";

import { useState } from "react";
import { Mail, Megaphone, Plus } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Popover } from "@/components/patterns/primitives/Popover";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { AddPromotionModal } from "./AddPromotionModal";
import type { EventPromotionItem, EventPromotionType } from "@/data/mocks/events";

export type PromotionInsertRowProps = {
  onInsert: (item: Omit<EventPromotionItem, "id">) => void;
};

/**
 * Slim "+" affordance between promotion cards. Clicking it opens a dropdown
 * right at that spot to choose email vs. social post, which then opens the
 * matching modal for the specifics.
 */
export function PromotionInsertRow({ onInsert }: PromotionInsertRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalType, setModalType] = useState<EventPromotionType | null>(null);

  function openModal(type: EventPromotionType) {
    setIsMenuOpen(false);
    setModalType(type);
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: "var(--linear-color-hairline)" }} />
        <Popover
          isOpen={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          alignment="center"
          width={180}
          content={
            <Card padding={2} style={{ boxShadow: "var(--linear-shadow-canvas)" }}>
              <VStack gap={1}>
                <button
                  type="button"
                  onClick={() => openModal("email")}
                  style={menuItemStyle}
                >
                  <Icon icon={Mail} size="sm" color="secondary" />
                  <Text>Email</Text>
                </button>
                <button
                  type="button"
                  onClick={() => openModal("social")}
                  style={menuItemStyle}
                >
                  <Icon icon={Megaphone} size="sm" color="secondary" />
                  <Text>Social post</Text>
                </button>
              </VStack>
            </Card>
          }
        >
          <IconButton
            label="Add promotion item"
            variant="secondary"
            size="sm"
            icon={<Plus size={14} strokeWidth={1.75} />}
          />
        </Popover>
        <div style={{ flex: 1, height: 1, background: "var(--linear-color-hairline)" }} />
      </div>

      <AddPromotionModal
        type={modalType}
        onClose={() => setModalType(null)}
        onAdd={onInsert}
      />
    </>
  );
}

const menuItemStyle = {
  all: "unset" as const,
  boxSizing: "border-box" as const,
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  cursor: "pointer",
};
