"use client";

import { useState, useTransition } from "react";
import { createGuest, updateGuest } from "@/lib/actions/guests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Event, Guest, GuestStatus } from "@/generated/prisma/client";

type FamilyOption = { token: string; label: string };

const STATUS_LABEL: Record<GuestStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DECLINED: "Recusado",
};

export function GuestDialog({
  events,
  families,
  guest,
  defaultFamilyToken,
  trigger,
}: {
  events: Event[];
  families: FamilyOption[];
  guest?: Guest;
  defaultFamilyToken?: string;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [eventId, setEventId] = useState(guest?.eventId ?? events[0]?.id ?? "");
  const [familyToken, setFamilyToken] = useState(defaultFamilyToken ?? "new");
  const [status, setStatus] = useState<GuestStatus>(guest?.status ?? "PENDING");

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("eventId", eventId);
    if (guest) formData.set("status", status);
    else formData.set("familyToken", familyToken);

    startTransition(async () => {
      const result = guest ? await updateGuest(guest.id, formData) : await createGuest(formData);
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
          <DialogTitle>{guest ? "Editar convidado" : "Novo convidado"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={guest?.name} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">WhatsApp (opcional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(11) 91234-5678"
              defaultValue={guest?.phone ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Preencha em pelo menos um membro da família para poder enviar o convite por
              WhatsApp.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Evento</Label>
            <Select value={eventId} onValueChange={(value) => setEventId(value ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!guest && (
            <div className="flex flex-col gap-1.5">
              <Label>Família</Label>
              <Select value={familyToken} onValueChange={(value) => setFamilyToken(value ?? "new")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nova família</SelectItem>
                  {families.map((family) => (
                    <SelectItem key={family.token} value={family.token}>
                      {family.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Convidados da mesma família compartilham um único link de confirmação.
              </p>
            </div>
          )}

          {guest && (
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as GuestStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as GuestStatus[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {STATUS_LABEL[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending || !eventId}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
