/**
 * Logique de calcul des prix pour DECOR MALI
 * Version corrigée et compatible avec le front (QuotePage.tsx)
 */

// === CONSTANTES DE BASE ===

// Prix de base pour un matelas standard de 1m90
const BASE_MATTRESS_PRICE = 130000; // FCFA
const BASE_MATTRESS_LENGTH = 190;   // cm
const MAX_MATTRESS_LENGTH = 240;    // cm

// Prix des bras (par bras)
const ARM_PRICE_EACH = 48000;       // FCFA
const DEFAULT_ARM_COUNT = 2;

// Prix des tables
const SMALL_TABLE_PRICE = 50000;    // FCFA
const BIG_TABLE_PRICE = 130000;     // FCFA

// Frais de transport et livraison
const TRANSPORT_FEE = 500000;       // FCFA (fixe par salon)
const DELIVERY_FEE_BAMAKO = 75000;  // FCFA

// Bénéfice fixe par salon
const PROFIT_PER_SALON = 500000;    // FCFA

// Prix du tapis par mètre carré
const CARPET_PRICE_PER_SQM = 13000; // FCFA

// Prix des rideaux selon la qualité
const CURTAIN_PRICES = {
  dubai: 6000,   // 1ère qualité Dubai
  quality2: 4500, // 2ème qualité
  quality3: 4000, // 3ème qualité
} as const;

// === TYPES ===

export type CurtainQuality = keyof typeof CURTAIN_PRICES;

export interface SalonPricingInput {
  mattressLength: number; // cm
  mattressCount: number;
  cornerCount: number;
  armCount?: number;
  thicknessMultiplier?: number; // en pourcentage (100 = normal)
  fabricPricePerMeter?: number; // (réservé pour évolutions)
  hasSmallTable?: boolean;
  hasBigTable?: boolean;
  needsDelivery?: boolean;
  deliveryLocation?: string;
}

export interface CarpetPricingInput {
  length: number;
  width: number;
  needsDelivery?: boolean;
  deliveryLocation?: string;
}

export interface CurtainPricingInput {
  length: number;
  width: number;
  quality: CurtainQuality;
  needsDelivery?: boolean;
  deliveryLocation?: string;
}

export interface PricingResult {
  subtotal: number;
  deliveryFee: number;
  total: number;
  breakdown: {
    mattresses?: number;
    corners?: number;
    arms?: number;
    smallTable?: number;
    bigTable?: number;
    transport?: number;
    profit?: number;
    carpet?: number;   // compat (tapis)
    curtain?: number;  // prix rideau (m² * tarif)
  };
}

// === OUTILS ===

/** Coerce en nombre fini >= 0 (sinon 0) */
function n(v: unknown): number {
  const x =
    typeof v === "string"
      ? Number(v.replace(/\s/g, "").replace(",", "."))
      : Number(v);
  return Number.isFinite(x) && x > 0 ? x : 0;
}

/** Teste si la livraison est à Bamako (simple, côté serveur) */
function isBamako(loc?: string): boolean {
  return !!loc && loc.toLowerCase().includes("bamako");
}

/**
 * Calcule le prix d’un matelas selon sa longueur et son épaisseur
 */
export function calculateMattressPrice(
  length: number,
  thicknessMultiplier: number = 100
): number {
  let L = n(length);
  if (!L) L = BASE_MATTRESS_LENGTH;
  if (L > MAX_MATTRESS_LENGTH) {
    throw new Error(
      `La longueur du matelas ne peut pas dépasser ${MAX_MATTRESS_LENGTH} cm.`
    );
  }

  const mult = Math.max(1, n(thicknessMultiplier) || 100) / 100;
  const pricePerCm = BASE_MATTRESS_PRICE / BASE_MATTRESS_LENGTH;
  const basePrice = pricePerCm * L;
  return Math.round(basePrice * mult);
}

/**
 * Prix d’un coin — équivalent à un matelas standard (même épaisseur)
 */
export function calculateCornerPrice(thicknessMultiplier: number = 100): number {
  return calculateMattressPrice(BASE_MATTRESS_LENGTH, thicknessMultiplier);
}

/**
 * Calcule le prix d’un salon marocain complet
 */
export function calculateSalonPrice(input: SalonPricingInput): PricingResult {
  const {
    mattressLength = BASE_MATTRESS_LENGTH,
    mattressCount = 1,
    cornerCount = 0,
    armCount = DEFAULT_ARM_COUNT,
    thicknessMultiplier = 100,
    // fabricPricePerMeter (réservé)
    hasSmallTable = false,
    hasBigTable = false,
    needsDelivery = false,
    deliveryLocation = "",
  } = input || {};

  const breakdown: PricingResult["breakdown"] = {};

  // Matelas
  const mattressUnit = calculateMattressPrice(mattressLength, thicknessMultiplier);
  breakdown.mattresses = Math.round(mattressUnit * Math.max(1, n(mattressCount)));

  // Coins
  const cornerUnit = calculateCornerPrice(thicknessMultiplier);
  breakdown.corners = Math.round(cornerUnit * Math.max(0, n(cornerCount)));

  // Bras
  breakdown.arms = Math.round(ARM_PRICE_EACH * Math.max(0, Math.floor(n(armCount) || 0)));

  // Tables
  if (hasSmallTable) breakdown.smallTable = SMALL_TABLE_PRICE;
  if (hasBigTable) breakdown.bigTable = BIG_TABLE_PRICE;

  // Transport et bénéfice fixes
  breakdown.transport = TRANSPORT_FEE;
  breakdown.profit = PROFIT_PER_SALON;

  // Sous-total
  const subtotal = Object.values(breakdown).reduce((sum, val) => sum + (val || 0), 0);

  // Livraison
  const deliveryFee = needsDelivery && isBamako(deliveryLocation) ? DELIVERY_FEE_BAMAKO : 0;

  return {
    subtotal: Number(subtotal),
    deliveryFee: Number(deliveryFee),
    total: Number(subtotal + deliveryFee),
    breakdown,
  };
}

/**
 * Calcule le prix d’un tapis
 */
export function calculateCarpetPrice(input: CarpetPricingInput): PricingResult {
  const {
    length = 0,
    width = 0,
    needsDelivery = false,
    deliveryLocation = "",
  } = input || {};

  const L = n(length);
  const W = n(width);
  const area = L * W; // m²

  const breakdown: PricingResult["breakdown"] = {};
  breakdown.carpet = Math.round(area * CARPET_PRICE_PER_SQM);

  const subtotal = breakdown.carpet || 0;
  const deliveryFee = needsDelivery && isBamako(deliveryLocation) ? DELIVERY_FEE_BAMAKO : 0;

  return {
    subtotal: Number(subtotal),
    deliveryFee: Number(deliveryFee),
    total: Number(subtotal + deliveryFee),
    breakdown,
  };
}

/**
 * Calcule le prix d’un rideau
 */
export function calculateCurtainPrice(input: CurtainPricingInput): PricingResult {
  const {
    length = 0,
    width = 0,
    quality = "dubai",
    needsDelivery = false,
    deliveryLocation = "",
  } = input || {};

  const L = n(length);
  const W = n(width);
  const pricePerSqm = CURTAIN_PRICES[quality] ?? CURTAIN_PRICES.dubai;

  const area = L * W;
  const breakdown: PricingResult["breakdown"] = {};

  // Utilise 'curtain' et garde 'carpet' pour compat éventuelle d’affichage
  const computed = Math.round(area * pricePerSqm);
  breakdown.curtain = computed;
  breakdown.carpet = computed; // compat si l’UI lit encore "carpet"

  const subtotal = computed;
  const deliveryFee = needsDelivery && isBamako(deliveryLocation) ? DELIVERY_FEE_BAMAKO : 0;

  return {
    subtotal: Number(subtotal),
    deliveryFee: Number(deliveryFee),
    total: Number(subtotal + deliveryFee),
    breakdown,
  };
}

/**
 * Formate un prix en FCFA
 */
export function formatPrice(amount: number): string {
  const a = Number.isFinite(amount) ? Number(amount) : 0;
  return `${a.toLocaleString("fr-FR")} FCFA`;
}
