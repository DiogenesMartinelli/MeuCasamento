"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ColorPickerField({
  name,
  defaultValue,
  ariaLabel,
  onChange,
}: {
  name: string;
  defaultValue?: string | null;
  ariaLabel?: string;
  onChange?: (value: string) => void;
}) {
  const [color, setColor] = useState(defaultValue ?? "");

  function update(value: string) {
    setColor(value);
    onChange?.(value);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color || "#000000"}
        onChange={(e) => update(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
        aria-label={ariaLabel ?? "Escolher cor"}
      />
      <Input
        name={name}
        value={color}
        onChange={(e) => update(e.target.value)}
        placeholder="Usar cor padrão do estilo"
        className="max-w-40"
      />
      {color && (
        <Button type="button" variant="ghost" size="sm" onClick={() => update("")}>
          Limpar
        </Button>
      )}
    </div>
  );
}
