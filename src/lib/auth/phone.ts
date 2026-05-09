export function normalizePhoneNumber(phone: string) {
  const trimmed = phone.trim().replace(/[\s()-]/g, "");

  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  if (trimmed.startsWith("0")) {
    return `+62${trimmed.slice(1)}`;
  }

  if (trimmed.startsWith("62")) {
    return `+${trimmed}`;
  }

  if (/^\d+$/.test(trimmed)) {
    return `+62${trimmed}`;
  }

  return trimmed;
}

export function formatPhoneForFonnte(phone: string) {
  return normalizePhoneNumber(phone).replace(/^\+/, "");
}
