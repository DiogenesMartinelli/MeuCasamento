"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url, label = "Copiar link RSVP" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copiado!" : label}
    </Button>
  );
}
