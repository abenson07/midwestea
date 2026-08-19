"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { StateAutocomplete } from "./StateAutocomplete";
import { normalizeMapsUrl } from "./locationData";
import type { LocationRow } from "./types";

export type AddLocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (location: Omit<LocationRow, "id">) => void;
};

export function AddLocationModal({ isOpen, onClose, onCreate }: AddLocationModalProps) {
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");

  function reset() {
    setName("");
    setStreet("");
    setCity("");
    setState("");
    setZip("");
    setMapsUrl("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Location name is required.");
      return;
    }
    onCreate({
      name: name.trim(),
      street: street.trim(),
      city: city.trim(),
      state,
      zip: zip.trim(),
      mapsUrl: normalizeMapsUrl(mapsUrl),
    });
    reset();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add location"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button label="Cancel" variant="ghost" onClick={handleClose} />
          <Button label="Add" variant="primary" onClick={handleSubmit} />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextInput label="Location name" value={name} onChange={setName} />
        <TextInput label="Street" value={street} onChange={setStreet} />
        <TextInput label="City" value={city} onChange={setCity} />
        <StateAutocomplete value={state} onChange={setState} />
        <TextInput label="Zip" value={zip} onChange={setZip} />
        <TextInput
          label="Google Maps URL"
          value={mapsUrl}
          onChange={setMapsUrl}
          autoComplete="off"
        />
      </div>
    </Modal>
  );
}
