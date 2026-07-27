"use client";

import { useState, type ChangeEvent } from "react";
import { createRsvpVideoUploadUrl } from "@/lib/actions/rsvp-theme";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Matches SUPABASE_STORAGE_BUCKET on the server (src/lib/storage.ts) - not exposed to
// the client via NEXT_PUBLIC_, but this is the one bucket the project ever uses.
const BUCKET = "meucasamento";
const MAX_BYTES = 15 * 1024 * 1024;

export function VideoField({
  currentUrl,
  onUploaded,
}: {
  currentUrl?: string | null;
  onUploaded?: (url: string) => void;
}) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setStatus("error");
      setError("O vídeo precisa ter no máximo 15MB.");
      return;
    }

    setStatus("uploading");
    setError(null);
    try {
      const { path, token, publicUrl } = await createRsvpVideoUploadUrl(file.name, file.size);
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from(BUCKET).uploadToSignedUrl(path, token, file);
      if (uploadError) throw uploadError;

      setUrl(publicUrl);
      onUploaded?.(publicUrl);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Falha no upload do vídeo.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="rsvpBackgroundVideo">Vídeo de fundo</Label>
      <input type="hidden" name="backgroundVideoUrl" value={url} />
      {url && (
        <video
          src={url}
          className="h-32 w-full max-w-xs rounded-md border object-cover sm:h-40"
          muted
          loop
          autoPlay
          playsInline
        />
      )}
      <Input
        id="rsvpBackgroundVideo"
        type="file"
        accept="video/*"
        onChange={handleChange}
        disabled={status === "uploading"}
      />
      {status === "uploading" && <p className="text-xs text-muted-foreground">Enviando vídeo...</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">MP4 ou WebM, até 15MB. Toca em loop, sem som.</p>
    </div>
  );
}
