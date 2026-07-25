"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { createGift, updateGift } from "@/lib/actions/gifts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Event, Gift, GiftType } from "@/generated/prisma/client";

export function GiftDialog({
  events,
  gift,
  trigger,
}: {
  events: Event[];
  gift?: Gift;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [eventId, setEventId] = useState(gift?.eventId ?? events[0]?.id ?? "");
  const [type, setType] = useState<GiftType>(gift?.type ?? "PHYSICAL_LINK");
  const [title, setTitle] = useState(gift?.title ?? "");
  const [description, setDescription] = useState(gift?.description ?? "");
  const [imageUrl, setImageUrl] = useState(gift?.imageUrl ?? "");
  const [productUrl, setProductUrl] = useState(gift?.productUrl ?? "");
  const [price, setPrice] = useState(gift?.price ? String(gift.price) : "");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  async function handleScrape() {
    if (!productUrl.trim()) {
      setScrapeError("Cole o link do produto primeiro");
      return;
    }
    setScraping(true);
    setScrapeError(null);
    try {
      const res = await fetch("/api/scrape-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível ler o link");
      if (data.title && !title) setTitle(data.title);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.description && !description) setDescription(data.description);
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : "Erro ao buscar informações");
    } finally {
      setScraping(false);
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("eventId", eventId);
    formData.set("type", type);
    formData.set("imageUrl", imageUrl);
    if (type === "PHYSICAL_LINK") formData.set("productUrl", productUrl);
    if (type === "CASH_QUOTA") formData.set("price", price);

    startTransition(async () => {
      const result = gift ? await updateGift(gift.id, formData) : await createGift(formData);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{gift ? "Editar presente" : "Novo presente"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as GiftType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHYSICAL_LINK">Produto de loja (link)</SelectItem>
                <SelectItem value="CASH_QUOTA">Cota em dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "PHYSICAL_LINK" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="productUrl">Link do produto</Label>
              <div className="flex gap-2">
                <Input
                  id="productUrl"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.loja.com/produto"
                />
                <Button type="button" variant="outline" onClick={handleScrape} disabled={scraping}>
                  {scraping ? "Buscando..." : "Buscar"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cole o link e clique em Buscar para preencher título e imagem automaticamente.
              </p>
              {scrapeError && <p className="text-sm text-destructive">{scrapeError}</p>}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {imageUrl && (
            <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-md border bg-muted">
              <Image src={imageUrl} alt={title || "Presente"} fill className="object-cover" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrlInput">URL da imagem</Label>
            <Input
              id="imageUrlInput"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {type === "CASH_QUOTA" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Valor da cota (R$)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          )}

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

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending || !eventId}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
