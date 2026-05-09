/** Build https://wa.me/... for Indonesian-style numbers (0…, 62…, +62…). */
export function buildWhatsAppLink(phone: string | null | undefined): string | null {
  if (!phone?.trim()) {
    return null;
  }

  let digits = phone.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (!digits.startsWith("62") && digits.length >= 9) {
    digits = `62${digits}`;
  }

  return `https://wa.me/${digits}`;
}
