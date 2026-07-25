"use client";

import { useState, useTransition } from "react";
import { createEvent, updateEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Event } from "@/generated/prisma/client";

function toDatetimeLocalValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function EventDialog({ event, trigger }: { event?: Event; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = event ? await updateEvent(event.id, formData) : await createEvent(formData);
      if (result.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) setError(null);
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? "Editar evento" : "Novo evento"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={event?.name}
              placeholder="Casamento, Chá de Panela..."
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Data e hora</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              defaultValue={event ? toDatetimeLocalValue(event.date) : undefined}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={event?.description ?? ""}
              rows={2}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
