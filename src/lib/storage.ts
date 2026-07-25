import { createServiceRoleClient } from "@/lib/supabase/server";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "meucasamento";

/** Uploads an image to the shared Supabase Storage bucket and returns its public URL. */
export async function uploadImage(file: File, path: string) {
  const supabase = createServiceRoleClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) throw new Error(`Falha no upload da imagem: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
