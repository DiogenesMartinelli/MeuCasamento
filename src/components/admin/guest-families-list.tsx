"use client";

import { useMemo, useState } from "react";
import { deleteGuest } from "@/lib/actions/guests";
import { GuestDialog } from "@/components/admin/guest-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { InviteDialog } from "@/components/admin/invite-dialog";
import { BulkWhatsAppDialog, type BulkFamily } from "@/components/admin/bulk-whatsapp-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Event, Guest, GuestRelationship, GuestStatus } from "@/generated/prisma/client";

type Family = {
  familyToken: string;
  members: (Guest & { event: Event })[];
  label: string;
  phone: string | null;
};

const STATUS_VARIANT: Record<GuestStatus, "default" | "secondary" | "outline"> = {
  CONFIRMED: "default",
  DECLINED: "outline",
  PENDING: "secondary",
};
const STATUS_LABEL: Record<GuestStatus, string> = {
  CONFIRMED: "Confirmado",
  DECLINED: "Recusado",
  PENDING: "Pendente",
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

export function GuestFamiliesList({
  families,
  events,
  appUrl,
  slug,
  coupleName,
  photoUrl,
}: {
  families: Family[];
  events: Event[];
  appUrl: string;
  slug: string;
  coupleName: string;
  photoUrl?: string | null;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = families.length > 0 && selected.size === families.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(families.map((f) => f.familyToken)));
  }

  function toggleOne(token: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
  }

  const bulkFamilies: BulkFamily[] = useMemo(
    () =>
      families
        .filter((f) => selected.has(f.familyToken))
        .map((f) => ({
          familyToken: f.familyToken,
          label: f.label,
          phone: f.phone,
          rsvpUrl: `${appUrl}/c/${slug}/rsvp/${f.familyToken}`,
        })),
    [families, selected, appUrl, slug],
  );

  if (families.length === 0) {
    return <p className="mt-8 text-sm text-muted-foreground">Nenhum convidado cadastrado ainda.</p>;
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
          Selecionar todas as famílias
        </label>
        <BulkWhatsAppDialog
          families={bulkFamilies}
          coupleName={coupleName}
          trigger={
            <Button size="sm" disabled={selected.size === 0}>
              Enviar convites selecionados ({selected.size})
            </Button>
          }
        />
      </div>

      {families.map((family) => {
        const rsvpUrl = `${appUrl}/c/${slug}/rsvp/${family.familyToken}`;
        return (
          <Card key={family.familyToken}>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.has(family.familyToken)}
                    onCheckedChange={() => toggleOne(family.familyToken)}
                  />
                  <span className="text-sm font-medium text-muted-foreground">{family.label}</span>
                </label>
                <div className="flex items-center gap-2">
                  <CopyLinkButton url={rsvpUrl} />
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <a href={rsvpUrl} target="_blank" rel="noopener noreferrer">
                        Ver como convidado
                      </a>
                    }
                  />
                  <InviteDialog
                    familyLabel={family.label}
                    familyPhone={family.phone}
                    rsvpUrl={rsvpUrl}
                    coupleName={coupleName}
                    photoUrl={photoUrl}
                    trigger={
                      <Button variant="outline" size="sm">
                        Convite
                      </Button>
                    }
                  />
                  <GuestDialog
                    events={events}
                    defaultFamilyToken={family.familyToken}
                    trigger={
                      <Button variant="outline" size="sm">
                        + Membro
                      </Button>
                    }
                  />
                </div>
              </div>
              <ul className="mt-3 divide-y">
                {family.members.map((guest) => (
                  <li key={guest.id} className="flex items-center justify-between gap-3 py-2">
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {guest.event.name}
                        {" · "}
                        {RELATIONSHIP_LABEL[guest.relationship]}
                        {guest.isPadrinho ? " (Padrinho/Madrinha)" : ""}
                        {guest.phone ? ` · ${guest.phone}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[guest.status]}>
                        {STATUS_LABEL[guest.status]}
                      </Badge>
                      <GuestDialog
                        events={events}
                        guest={guest}
                        trigger={
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        }
                      />
                      <DeleteButton
                        action={() => deleteGuest(guest.id)}
                        confirmMessage={`Remover ${guest.name}?`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
