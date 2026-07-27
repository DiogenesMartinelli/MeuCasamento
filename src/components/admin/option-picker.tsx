"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OptionPickerOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
};

/**
 * Generalized version of the hidden-input + button-grid pattern used by
 * TemplatePicker and ShapePicker: submits via a native hidden input so it works
 * inside a plain <form action={...}>, no controlled Select wiring needed.
 */
export function OptionPicker<T extends string>({
  name,
  options,
  defaultValue,
  onChange,
  size = "md",
}: {
  name: string;
  options: OptionPickerOption<T>[];
  defaultValue: T;
  onChange?: (value: T) => void;
  size?: "sm" | "md";
}) {
  const [selected, setSelected] = useState<T>(defaultValue);

  function select(value: T) {
    setSelected(value);
    onChange?.(value);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={selected} />
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === selected;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => select(option.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border transition-colors hover:border-foreground/40",
                size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
                active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border",
              )}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>
      {options.find((o) => o.value === selected)?.description && (
        <p className="text-xs text-muted-foreground">
          {options.find((o) => o.value === selected)?.description}
        </p>
      )}
    </div>
  );
}
