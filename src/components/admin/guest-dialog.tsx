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
import type { Event, Guest, GuestRelationship, GuestStatus } from "@/generated/prisma/client";

const STATUS_LABEL: Record<GuestStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DECLINED: "Recusado",
};

const RELATIONSHIP_LABEL: Record<GuestRelationship, string> = {
  AMIGO: "Amigo(a)",
  PADRINHO: "Padrinho/Madrinha",
  PAI: "Pai",
  MAE: "Mãe",
  AVO: "Avô/Avó",
  TIO: "Tio",
  TIA: "Tia",
  PRIMO: "Primo(a)",
  OUTRO: "Outro",
};

const CAN_BE_WEDDING_SPONSOR: GuestRelationship[] = ["TIO", "TIA", "PRIMO"];

export function GuestDialog({
  events,
  guest,
  defaultFamilyToken,
  trigger,
}: {
  events: Event[];
  guest?: Guest;
  defaultFamilyToken?: string;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [eventId, setEventId] = useState(guest?.eventId ?? events[0]?.id ?? "");
  const [status, setStatus] = useState<GuestStatus>(guest?.status ?? "PENDING");
  const [relationship, setRelationship] = useState<GuestRelationship>(guest?.relationship ?? "AMIGO");
  const [isPadrinho, setIsPadrinho] = useState(guest?.isPadrinho ?? false);
  // Not shown in the UI anymore, but still submitted: "+ Membro" pre-sets this to an
  // existing family's token, and the general "Novo convidado" button always starts a
  // new one - there's no longer a visible way to redirect a guest into a different
  // existing family from this dialog.
  const familyToken = defaultFamilyToken ?? "new";

  const selectedEvent = events.find((event) => event.id === eventId);
  const showPadrinhoOption = CAN_BE_WEDDING_SPONSOR.includes(relationship) && !!selectedEvent?.isWedding;

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("eventId", eventId);
    formData.set("relationship", relationship);
    formData.set("isPadrinho", String(showPadrinhoOption && isPadrinho));
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
                <SelectValue placeholder="Selecione o evento">
                  {(value: string | null) => events.find((event) => event.id === value)?.name ?? "Selecione o evento"}
                </SelectValue>
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

          <div className="flex flex-col gap-1.5">
            <Label>Parentesco</Label>
            <Select value={relationship} onValueChange={(value) => setRelationship((value as GuestRelationship) ?? "OUTRO")}>
              <SelectTrigger>
                <SelectValue>
                  {(value: string | null) => RELATIONSHIP_LABEL[value as GuestRelationship] ?? "Selecione"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RELATIONSHIP_LABEL) as GuestRelationship[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {RELATIONSHIP_LABEL[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Relação do convidado com o casal.</p>
          </div>

          {showPadrinhoOption && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPadrinho}
                onChange={(e) => setIsPadrinho(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              É padrinho/madrinha do casamento?
            </label>
          )}

          {!guest && !defaultFamilyToken && (
            <p className="text-xs text-muted-foreground">
              Este convidado inicia uma nova família com link de confirmação próprio. Para
              adicionar alguém a uma família já existente, use o botão &quot;+ Membro&quot; dela.
            </p>
          )}

          {guest && (
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as GuestStatus)}>
                <SelectTrigger>
                  <SelectValue>
                    {(value: string | null) => STATUS_LABEL[value as GuestStatus] ?? "Selecione"}
                  </SelectValue>
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
