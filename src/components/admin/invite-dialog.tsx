"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { buildWhatsAppLink, buildRsvpMessage } from "@/lib/whatsapp";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = src;
  });
}

async function generateInviteCard({
  qrDataUrl,
  coupleName,
  photoUrl,
}: {
  qrDataUrl: string;
  coupleName: string;
  photoUrl?: string | null;
}): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado");

  ctx.fillStyle = "#fdf6ec";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let textStartY = 160;

  if (photoUrl) {
    try {
      const photo = await loadImage(photoUrl);
      const size = 320;
      const x = (canvas.width - size) / 2;
      const y = 60;
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(photo, x, y, size, size);
      ctx.restore();
      textStartY = 460;
    } catch {
      // photo failed to load (e.g. CORS) - fall back to a text-only card
      textStartY = 160;
    }
  }

  ctx.fillStyle = "#3f2e1a";
  ctx.textAlign = "center";
  ctx.font = "bold 48px serif";
  wrapText(ctx, coupleName, canvas.width / 2, textStartY, 680, 54);

  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#5c4a35";
  ctx.fillText("Confirme sua presença", canvas.width / 2, textStartY + 70);

  const qrImg = await loadImage(qrDataUrl);
  const qrSize = 380;
  ctx.drawImage(qrImg, (canvas.width - qrSize) / 2, textStartY + 110, qrSize, qrSize);

  return canvas.toDataURL("image/png");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let offsetY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, offsetY);
      line = word;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, offsetY);
}

export function InviteDialog({
  trigger,
  familyLabel,
  familyPhone,
  rsvpUrl,
  coupleName,
  photoUrl,
}: {
  trigger: React.ReactElement;
  familyLabel: string;
  familyPhone: string | null;
  rsvpUrl: string;
  coupleName: string;
  photoUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [message, setMessage] = useState(() => buildRsvpMessage(coupleName, familyLabel, rsvpUrl));

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(rsvpUrl, { width: 320, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [open, rsvpUrl]);

  async function handleGenerateCard() {
    if (!qrDataUrl) return;
    setGeneratingCard(true);
    setCardError(null);
    try {
      const dataUrl = await generateInviteCard({ qrDataUrl, coupleName, photoUrl });
      setCardDataUrl(dataUrl);
    } catch {
      setCardError("Não foi possível gerar o card. Tente novamente.");
    } finally {
      setGeneratingCard(false);
    }
  }

  const whatsappLink = familyPhone ? buildWhatsAppLink(familyPhone, message) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setCardDataUrl(null);
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convite para {familyLabel}</DialogTitle>
          <DialogDescription>QR code, card para baixar e envio por WhatsApp.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR Code do link de confirmação" width={200} height={200} />
          ) : (
            <div className="flex h-[200px] w-[200px] items-center justify-center text-sm text-muted-foreground">
              Gerando QR code...
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {qrDataUrl && (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<a href={qrDataUrl} download={`qrcode-${familyLabel}.png`}>Baixar QR Code</a>}
              />
            )}
            {cardDataUrl ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <a href={cardDataUrl} download={`convite-${familyLabel}.png`}>
                    Baixar card de convite
                  </a>
                }
              />
            ) : (
              <Button variant="outline" size="sm" onClick={handleGenerateCard} disabled={generatingCard}>
                {generatingCard ? "Gerando card..." : "Gerar card de convite"}
              </Button>
            )}
          </div>
          {cardError && <p className="text-xs text-destructive">{cardError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="whatsapp-message">Mensagem do WhatsApp</Label>
          <Textarea
            id="whatsapp-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {whatsappLink ? (
            <Button
              nativeButton={false}
              render={
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  Enviar no WhatsApp
                </a>
              }
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              Adicione um telefone a um membro dessa família (editar convidado) para poder enviar
              por WhatsApp.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
