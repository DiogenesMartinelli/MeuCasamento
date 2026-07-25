"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmMessage,
  children = "Excluir",
}: {
  action: () => Promise<{ error?: string } | void>;
  confirmMessage: string;
  children?: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (typeof window !== "undefined" && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      try {
        const result = await action();
        if (result && "error" in result && result.error) {
          window.alert(result.error);
        }
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Não foi possível concluir a ação");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      {isPending ? "..." : children}
    </Button>
  );
}
