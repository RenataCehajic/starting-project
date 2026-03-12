export function isValidTiptapJson(value: string): boolean {
  try {
    const doc = JSON.parse(value);
    return doc !== null && typeof doc === "object" && doc.type === "doc";
  } catch {
    return false;
  }
}
