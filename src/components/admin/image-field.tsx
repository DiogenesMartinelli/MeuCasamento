"use client";

import type { ChangeEvent } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageField({
  name,
  label,
  currentUrl,
  onPreview,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  onPreview?: (url: string) => void;
}) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onPreview) onPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {currentUrl && (
        <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-md border bg-muted sm:h-40">
          <Image src={currentUrl} alt={label} fill className="object-cover" unoptimized={currentUrl.startsWith("blob:")} />
        </div>
      )}
      <Input id={name} name={name} type="file" accept="image/*" onChange={handleChange} />
    </div>
  );
}
