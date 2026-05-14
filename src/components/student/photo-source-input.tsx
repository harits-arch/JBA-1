"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function PhotoSourceInput({
  name,
  required = false
}: {
  name: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  function openPicker(mode: "camera" | "gallery") {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    if (mode === "camera") {
      input.setAttribute("capture", "environment");
    } else {
      input.removeAttribute("capture");
    }

    input.click();
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        name={name}
        type="file"
        required={required}
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setSelectedLabel(file?.name ?? null);
        }}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button type="button" className="w-full" onClick={() => openPicker("camera")}>
          Ambil Foto
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => openPicker("gallery")}
        >
          Pilih dari Galeri
        </Button>
      </div>
      {selectedLabel ? (
        <p className="text-xs text-muted-foreground">Dipilih: {selectedLabel}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          JPG, PNG, atau WEBP. Foto dikompres otomatis di perangkat (target ~200KB)
          sebelum unggah.
        </p>
      )}
    </div>
  );
}
