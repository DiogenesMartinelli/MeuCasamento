"use client";

import { useTransition } from "react";
import { setGiftStatus } from "@/lib/actions/gifts";
import { Button } from "@/components/ui/button";
import type { GiftStatus } from "@/generated/prisma/client";

export function GiftStatusToggle({ giftId, status }: { giftId: string; status: GiftStatus }) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = status === "AVAILABLE" ? "PURCHASED" : "AVAILABLE";
    startTransition(() => {
      setGiftStatus(giftId, next);
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={toggle} disabled={isPending}>
      {isPending ? "..." : status === "AVAILABLE" ? "Marcar recebido" : "Marcar disponível"}
    </Button>
  );
}
