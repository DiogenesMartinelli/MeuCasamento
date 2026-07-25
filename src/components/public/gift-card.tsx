"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GiftCheckoutDialog } from "./gift-checkout-dialog";
import type { Gift } from "@/generated/prisma/client";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function GiftCard({ gift }: { gift: Gift }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const purchased = gift.status === "PURCHASED";

  return (
    <Card className="flex flex-col overflow-hidden py-0">
      {gift.imageUrl && (
        <div className="relative h-44 w-full bg-muted">
          <Image
            src={gift.imageUrl}
            alt={gift.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {purchased && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="secondary">Já presenteado</Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="flex-1 pt-4">
        <CardTitle className="text-base">{gift.title}</CardTitle>
        {gift.description && (
          <CardContent className="line-clamp-2 p-0 text-sm text-muted-foreground">
            {gift.description}
          </CardContent>
        )}
      </CardHeader>
      <CardFooter className="flex items-center justify-between gap-3 pb-4">
        {gift.type === "CASH_QUOTA" && gift.price ? (
          <span className="font-semibold">{currency.format(Number(gift.price))}</span>
        ) : (
          <span />
        )}

        {gift.type === "PHYSICAL_LINK" ? (
          <Button
            disabled={purchased}
            variant={purchased ? "secondary" : "default"}
            nativeButton={false}
            render={
              <a href={gift.productUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                {purchased ? "Já presenteado" : "Presentear"}
              </a>
            }
          />
        ) : (
          <Button disabled={purchased} onClick={() => setDialogOpen(true)}>
            {purchased ? "Já presenteado" : "Presentear"}
          </Button>
        )}
      </CardFooter>

      {gift.type === "CASH_QUOTA" && (
        <GiftCheckoutDialog gift={gift} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </Card>
  );
}
