"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, buildRsvpMessage } from "@/lib/whatsapp";

export type BulkFamily = {
  familyToken: string;
  label: string;
  phone: string | null;
  rsvpUrl: string;
};

export function BulkWhatsAppDialog({
  trigger,
  families,
  coupleName,
}: {
  trigger: React.ReactElement;
  families: BulkFamily[];
  coupleName: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<Set<string>>(new Set());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar convites por WhatsApp</DialogTitle>
          <DialogDescription>
            {families.length} família(s) selecionada(s). Clique em enviar em cada uma - o
            WhatsApp abre numa aba nova com a mensagem pronta.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col divide-y">
          {families.map((family) => {
            const message = buildRsvpMessage(coupleName, family.label, family.rsvpUrl);
            const link = family.phone ? buildWhatsAppLink(family.phone, message) : null;
            const wasSent = sent.has(family.familyToken);

            return (
              <li key={family.familyToken} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{family.label}</p>
                  {!family.phone && (
                    <p className="text-xs text-muted-foreground">Sem telefone cadastrado</p>
                  )}
                </div>
                {link ? (
                  <Button
                    size="sm"
                    variant={wasSent ? "secondary" : "default"}
                    nativeButton={false}
                    render={
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          setSent((prev) => new Set(prev).add(family.familyToken))
                        }
                      >
                        {wasSent ? "Enviado" : "Enviar"}
                      </a>
                    }
                  />
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    Sem telefone
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
