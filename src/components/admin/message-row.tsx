"use client";

import { useTransition } from "react";
import { setGuestMessageVisibility, deleteGuestMessage } from "@/lib/actions/guest-messages";
import { Switch } from "@/components/ui/switch";
import { DeleteButton } from "@/components/admin/delete-button";
import type { GuestMessage } from "@/generated/prisma/client";

export function MessageRow({ message }: { message: GuestMessage }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-4 border-b py-4 last:border-b-0">
      <div>
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        <p className="mt-1 text-xs text-muted-foreground">— {message.authorName}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Visível</span>
          <Switch
            checked={message.isVisible}
            disabled={isPending}
            onCheckedChange={(checked) =>
              startTransition(() => setGuestMessageVisibility(message.id, checked))
            }
          />
        </div>
        <DeleteButton
          action={() => deleteGuestMessage(message.id)}
          confirmMessage="Excluir este recado permanentemente?"
        />
      </div>
    </div>
  );
}
