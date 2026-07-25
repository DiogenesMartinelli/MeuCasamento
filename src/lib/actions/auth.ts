"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error?: string; message?: string };

export async function signIn(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "Informe e-mail e senha" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha inválidos" };

  redirect("/admin");
}

export async function signUp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "Informe e-mail e senha" };
  if (password.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  if (!data.session) {
    return { message: "Conta criada! Verifique seu e-mail para confirmar antes de entrar." };
  }

  redirect("/admin/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
