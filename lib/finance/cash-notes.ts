/** GROQ expression: note count for one cashNotes document (supports legacy fields). */
export const GROQ_CASH_NOTE_QUANTITY = `select(
  defined(bundles100) || defined(bundles50) || defined(bundles) || defined(looseNotes) =>
    coalesce(bundles100, bundles, 0) * 100 + coalesce(bundles50, 0) * 50 + coalesce(looseNotes, 0),
  coalesce(quantity, 0)
)`;

export const NOTES_PER_BUNDLE_100 = 100;
export const NOTES_PER_BUNDLE_50 = 50;

export function getCashNoteQuantity(note: {
  bundles100?: number | null;
  bundles50?: number | null;
  bundles100Count?: number | null;
  bundles?: number | null;
  looseNotes?: number | null;
  quantity?: number | null;
}) {
  const hasBundleFields =
    note.bundles100 != null ||
    note.bundles50 != null ||
    note.bundles100Count != null ||
    note.bundles != null ||
    note.looseNotes != null;

  if (hasBundleFields) {
    const bundles100 = note.bundles100 ?? note.bundles100Count ?? note.bundles ?? 0;
    return (
      bundles100 * NOTES_PER_BUNDLE_100 +
      (note.bundles50 ?? 0) * NOTES_PER_BUNDLE_50 +
      (note.looseNotes ?? 0)
    );
  }

  return note.quantity ?? 0;
}

export function getCashNoteValue(
  note: {denomination: number} & Parameters<typeof getCashNoteQuantity>[0],
) {
  return note.denomination * getCashNoteQuantity(note);
}
