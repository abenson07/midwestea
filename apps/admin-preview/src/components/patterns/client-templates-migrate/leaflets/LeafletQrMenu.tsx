"use client";

import { useState } from "react";
import { Plus, QrCode as QrCodeIcon } from "lucide-react";
import { IconButton } from "@/components/patterns/primitives/IconButton";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/patterns/shared/dropdown";
import { LeafletQrCodeModal } from "./LeafletQrCodeModal";
import { sampleLeafletQrCodes, type LeafletQrCode } from "@/data/mocks/leaflets";

/**
 * Topbar QR-codes control — a dropdown listing this leaflet's QR codes plus
 * a "Generate new" action; picking one opens `LeafletQrCodeModal` for it.
 */
export function LeafletQrMenu() {
  const [codes, setCodes] = useState<LeafletQrCode[]>(sampleLeafletQrCodes);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<LeafletQrCode | null>(null);

  function handleSelect(code: LeafletQrCode) {
    setMenuOpen(false);
    setSelectedCode(code);
  }

  function handleGenerate() {
    const id = `qr-generated-${Date.now()}`;
    const generated: LeafletQrCode = {
      id,
      label: `New QR Code ${codes.length + 1}`,
      url: `https://mapleleafcommunity.org/qr/${id}`,
    };
    setCodes((prev) => [...prev, generated]);
    setMenuOpen(false);
    setSelectedCode(generated);
  }

  return (
    <>
      <Dropdown
        label="QR codes"
        open={isMenuOpen}
        onOpenChange={setMenuOpen}
        placement="below"
        alignment="end"
        trigger={
          <IconButton
            label="QR codes"
            variant="ghost"
            size="sm"
            icon={<Icon icon={QrCodeIcon} size="sm" color="secondary" />}
          />
        }
      >
        {codes.map((code) => (
          <DropdownItem key={code.id} label={code.label} onSelect={() => handleSelect(code)} />
        ))}
        <DropdownSeparator />
        <DropdownItem
          label="Generate new QR code"
          icon={<Plus size={16} strokeWidth={1.75} />}
          onSelect={handleGenerate}
        />
      </Dropdown>

      <LeafletQrCodeModal code={selectedCode} onClose={() => setSelectedCode(null)} />
    </>
  );
}
