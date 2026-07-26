"use client";

import { useState } from "react";
import { SITE_TEMPLATES } from "@/lib/site-templates";
import { cn } from "@/lib/utils";
import type { SiteTemplate } from "@/generated/prisma/client";

export function TemplatePicker({ defaultValue }: { defaultValue: SiteTemplate }) {
  const [selected, setSelected] = useState<SiteTemplate>(defaultValue);

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="template" value={selected} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SITE_TEMPLATES.map((template) => {
          const active = template.id === selected;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelected(template.id)}
              className={cn(
                "flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors hover:border-foreground/40",
                active ? "border-primary ring-2 ring-primary/30" : "border-border",
              )}
            >
              <div className="flex h-10 overflow-hidden rounded-md">
                {template.swatch.map((color, i) => (
                  <span key={i} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">{template.label}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
