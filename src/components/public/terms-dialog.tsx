"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TERMS_SECTIONS } from "@/lib/terms";

export function TermsDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Termos de Uso e Contrato de Prestação de Serviço
          </DialogTitle>
          <DialogDescription>
            Modelo padrão de contrato para uso da plataforma MeuCasamento.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 text-sm">
          {TERMS_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-1 font-semibold">{section.title}</h3>
              <p className="text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
