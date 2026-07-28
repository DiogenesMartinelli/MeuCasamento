"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GiftCheckoutDialog } from "./gift-checkout-dialog";
import { getAccentButtonStyle, getCardStyle, getMutedTextStyle, GIFT_CARD_SHAPE_CLASS } from "@/lib/accent-color";
import { cn } from "@/lib/utils";
import type { SerializedGift } from "@/lib/queries/gifts";
import type { GiftCardShape } from "@/generated/prisma/client";
import type { SiteColors } from "@/lib/accent-color";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function GiftCard({
  gift,
  colors,
  shape = "ROUNDED",
}: {
  gift: SerializedGift;
  colors?: SiteColors;
  shape?: GiftCardShape;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const purchased = gift.status === "PURCHASED";
  const shapeClass = GIFT_CARD_SHAPE_CLASS[shape];
  const accentStyle = purchased ? undefined : getAccentButtonStyle(colors?.accentColor);
  const cardStyle = getCardStyle(
    colors?.cardBackgroundColor,
    colors?.borderColor,
    colors?.cardBackgroundGradientTo,
    colors?.glassCards,
  );
  const mutedStyle = getMutedTextStyle(colors?.mutedTextColor);

  return (
    <Card className="flex flex-col overflow-hidden border py-0" style={cardStyle}>
      {gift.imageUrl && (
        <div className={cn("relative h-44 w-full bg-muted", shapeClass.image)}>
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
          <CardContent
            className="line-clamp-2 p-0 text-sm text-muted-foreground"
            style={mutedStyle}
          >
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
            className={shapeClass.button}
            style={accentStyle}
            nativeButton={false}
            render={
              <a href={gift.productUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                {purchased ? "Já presenteado" : "Presentear"}
              </a>
            }
          />
        ) : (
          <Button
            disabled={purchased}
            className={shapeClass.button}
            style={accentStyle}
            onClick={() => setDialogOpen(true)}
          >
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
