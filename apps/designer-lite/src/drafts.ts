type Lang = "uk" | "en";

export function bindJsonDrafts(): void {
  for (const id of ["manual", "json"]) {
    document.getElementById(id)?.addEventListener("input", (event) => {
      (event.currentTarget as HTMLElement).dataset.draftDirty = "true";
    });
  }
}

export function hasUnappliedDraft(ignoreId?: string): boolean {
  return ["manualPlan", "manual", "json"].some((id) => {
    if (id === ignoreId) return false;
    const editor = document.getElementById(id);
    return (
      editor?.dataset.manualDirty === "true" ||
      editor?.dataset.draftDirty === "true"
    );
  });
}

export function confirmDraftDiscard(lang: Lang, ignoreId?: string): boolean {
  if (!hasUnappliedDraft(ignoreId)) return true;
  return window.confirm(
    lang === "uk"
      ? "Зміни редактора ще не застосовано. Відкинути їх? Натисніть «Скасувати», щоб повернутися й застосувати зміни."
      : "Editor changes have not been applied. Discard them? Cancel to return and apply the changes.",
  );
}
