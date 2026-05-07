// Token bundles. Hardcoded, not configurable in v1.
// AT-FESTIVAL price is what families pay at the door (Square).
// PRE-PURCHASE price is what we charge online (15% less).

export const BUNDLES = {
  BUNDLE_25: {
    tokens: 25,
    atFestivalCents: 2500,
    prePurchaseCents: 2125,
    label: "25 tokens",
  },
  BUNDLE_50: {
    tokens: 50,
    atFestivalCents: 5000,
    prePurchaseCents: 4250,
    label: "50 tokens",
  },
  BUNDLE_100: {
    tokens: 100,
    atFestivalCents: 10000,
    prePurchaseCents: 8500,
    label: "100 tokens",
  },
  BUNDLE_200: {
    tokens: 200,
    atFestivalCents: 20000,
    prePurchaseCents: 17000,
    label: "200 tokens",
  },
} as const;

export type BundleType = keyof typeof BUNDLES;

// Format cents as AUD. e.g. 8500 -> "$85"
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars}`
    : `$${dollars.toFixed(2)}`;
}
