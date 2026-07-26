"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ColorPickerField({ defaultValue }: { defaultValue?: string | null }) {
  const [color, setColor] = useState(defaultValue ?? "");

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color || "#000000"}
        onChange={(e) => setColor(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
        aria-label="Escolher cor de destaque"
      />
      <Input
        name="accentColor"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        placeholder="Usar cor padrão do estilo"
        className="max-w-40"
      />
      {color && (
        <Button type="button" variant="ghost" size="sm" onClick={() => setColor("")}>
          Limpar
        </Button>
      )}
    </div>
  );
}
