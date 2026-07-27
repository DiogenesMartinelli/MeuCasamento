"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GradientColorField({
  name,
  gradientName,
  defaultValue,
  defaultGradientValue,
  ariaLabel,
  onChange,
  onGradientChange,
}: {
  name: string;
  gradientName: string;
  defaultValue?: string | null;
  defaultGradientValue?: string | null;
  ariaLabel?: string;
  onChange?: (value: string) => void;
  onGradientChange?: (value: string) => void;
}) {
  const [color, setColor] = useState(defaultValue ?? "");
  const [gradientTo, setGradientTo] = useState(defaultGradientValue ?? "");
  const [useGradient, setUseGradient] = useState(!!defaultGradientValue);

  function updateColor(value: string) {
    setColor(value);
    onChange?.(value);
  }

  function updateGradient(value: string) {
    setGradientTo(value);
    onGradientChange?.(value);
  }

  function toggleGradient(checked: boolean) {
    setUseGradient(checked);
    if (!checked) updateGradient("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color || "#000000"}
          onChange={(e) => updateColor(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
          aria-label={ariaLabel ?? "Escolher cor"}
        />
        <Input
          name={name}
          value={color}
          onChange={(e) => updateColor(e.target.value)}
          placeholder="Usar cor padrão do estilo"
          className="max-w-40"
        />
        {color && (
          <Button type="button" variant="ghost" size="sm" onClick={() => updateColor("")}>
            Limpar
          </Button>
        )}
      </div>

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={useGradient}
          onChange={(e) => toggleGradient(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-input"
        />
        Usar degradê (duas cores)
      </label>

      {useGradient && (
        <div className="flex items-center gap-2 pl-1">
          <input
            type="color"
            value={gradientTo || "#000000"}
            onChange={(e) => updateGradient(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
            aria-label="Segunda cor do degradê"
          />
          <Input
            name={gradientName}
            value={gradientTo}
            onChange={(e) => updateGradient(e.target.value)}
            placeholder="Segunda cor do degradê"
            className="max-w-40"
          />
        </div>
      )}
    </div>
  );
}
