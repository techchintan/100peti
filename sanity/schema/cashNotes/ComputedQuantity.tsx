"use client";

import {Stack, Text} from "@sanity/ui";
import {useFormValue} from "sanity";

export const NOTES_PER_BUNDLE_100 = 100;
export const NOTES_PER_BUNDLE_50 = 50;
export const MAX_LOOSE_NOTES = 49;

/** @deprecated Use NOTES_PER_BUNDLE_100 */
export const NOTES_PER_BUNDLE = NOTES_PER_BUNDLE_100;

export function getNoteQuantity(
  bundles100?: number | null,
  bundles50?: number | null,
  looseNotes?: number | null,
  legacyBundles?: number | null,
) {
  const count100 = bundles100 ?? legacyBundles ?? 0;
  return (
    count100 * NOTES_PER_BUNDLE_100 + (bundles50 ?? 0) * NOTES_PER_BUNDLE_50 + (looseNotes ?? 0)
  );
}

export function formatBundleBreakdown(bundles100: number, bundles50: number, looseNotes: number) {
  const parts: string[] = [];

  if (bundles100 > 0) {
    parts.push(`${bundles100} × ${NOTES_PER_BUNDLE_100}`);
  }
  if (bundles50 > 0) {
    parts.push(`${bundles50} × ${NOTES_PER_BUNDLE_50}`);
  }
  if (looseNotes > 0) {
    parts.push(`${looseNotes} loose`);
  }

  return parts.length > 0 ? parts.join(" + ") : "No notes counted";
}

export function ComputedQuantityInput() {
  const denomination = useFormValue(["denomination"]) as number | undefined;
  const bundles100 = useFormValue(["bundles100"]) as number | undefined;
  const bundles50 = useFormValue(["bundles50"]) as number | undefined;
  const looseNotes = useFormValue(["looseNotes"]) as number | undefined;
  const count100 = bundles100 ?? 0;
  const count50 = bundles50 ?? 0;
  const looseCount = looseNotes ?? 0;
  const denom = denomination ?? 0;
  const total = getNoteQuantity(count100, count50, looseCount);
  const totalValue = denom * total;

  return (
    <Stack space={3} padding={3}>
      <Text size={2} weight="semibold">
        {total.toLocaleString("en-IN")} notes
      </Text>
      <Text muted size={1}>
        {formatBundleBreakdown(count100, count50, looseCount)}
      </Text>
      {denom > 0 ? (
        <Text size={1} weight="medium">
          Value:{" "}
          {totalValue.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          })}
        </Text>
      ) : null}
    </Stack>
  );
}
