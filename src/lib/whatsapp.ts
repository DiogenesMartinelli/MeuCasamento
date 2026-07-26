/** Strips everything but digits and assumes Brazil (55) when no country code is present. */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildRsvpMessage(coupleName: string, familyLabel: string, rsvpUrl: string): string {
  return `Olá, ${familyLabel}! 💌\n\n${coupleName} gostariam muito de contar com a presença de vocês no nosso casamento!\n\nPor favor, confirme a presença por este link:\n${rsvpUrl}`;
}
