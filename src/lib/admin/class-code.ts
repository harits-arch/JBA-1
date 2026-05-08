export function generateClassCode(clientName: string, classDate: string) {
  const clientPrefix =
    clientName
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 6)
      .toUpperCase() || "JBA";
  const year = classDate ? new Date(classDate).getFullYear().toString() : "2026";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${clientPrefix}${year}${suffix}`;
}

export function normalizeClassCode(classCode: string) {
  return classCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}
