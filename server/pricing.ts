/**
 * Logique de calcul des prix pour DECOR MALI
 */

// Prix de base pour un matelas standard de 1m90
const BASE_MATTRESS_PRICE = 130000; // FCFA
const BASE_MATTRESS_LENGTH = 190; // cm
const MAX_MATTRESS_LENGTH = 240; // cm

// Prix des bras (par paire)
const ARM_PRICE_EACH = 48000; // FCFA
const DEFAULT_ARM_COUNT = 2;

// Prix des tables
const SMALL_TABLE_PRICE = 50000; // FCFA
const BIG_TABLE_PRICE = 130000; // FCFA

// Frais de transport et livraison
const TRANSPORT_FEE = 500000; // FCFA (fixe par salon)
const DELIVERY_FEE_BAMAKO = 75000; // FCFA

// Bénéfice fixe par salon
const PROFIT_PER_SALON = 500000; // FCFA

// Prix du tapis par mètre carré
const CARPET_PRICE_PER_SQM = 13000; // FCFA

// Prix des rideaux par mètre carré selon la qualité
const CURTAIN_PRICES = {
  dubai: 6000, // 1ère qualité Dubai
  quality2: 4500, // 2ème qualité
  quality3: 4000, // 3ème qualité
} as const;

export type CurtainQuality = keyof typeof CURTAIN_PRICES;

export interface SalonPricingInput {
  mattressLength: number; // en cm
  mattressCount: number;
  cornerCount: number;
  armCount?: number;
  thicknessMultiplier?: number; // en pourcentage (100 = normal, 120 = +20%)
  fabricPricePerMeter?: number; // Prix additionnel du tissu si différent du défaut
  hasSmallTable?: boolean;
  hasBigTable?: boolean;
  needsDelivery?: boolean;
  deliveryLocation?: string;
}

export interface CarpetPricingInput {
  length: number; // en mètres
  width: number; // en mètres
  needsDelivery?: boolean;
  deliveryLocation?: string;
}

export interface CurtainPricingInput {
  length: number; // en mètres (hauteur)
  width: number; // en mètres (largeur)
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
    carpet?: number;
  };
}

/**
 * Calcule le prix d'un matelas en fonction de sa longueur
 */
export function calculateMattressPrice(length: number, thicknessMultiplier: number = 100): number {
  if (length > MAX_MATTRESS_LENGTH) {
    throw new Error(`La longueur du matelas ne peut pas dépasser ${MAX_MATTRESS_LENGTH}cm`);
  }
  
  // Extrapolation linéaire du prix en fonction de la longueur
  const pricePerCm = BASE_MATTRESS_PRICE / BASE_MATTRESS_LENGTH;
  const basePrice = pricePerCm * length;
  
  // Application du multiplicateur d'épaisseur
  return Math.round(basePrice * (thicknessMultiplier / 100));
}

/**
 * Calcule le prix d'un coin (même prix qu'un matelas standard)
 */
export function calculateCornerPrice(thicknessMultiplier: number = 100): number {
  return calculateMattressPrice(BASE_MATTRESS_LENGTH, thicknessMultiplier);
}

/**
 * Calcule le prix total d'un salon marocain
 */
export function calculateSalonPrice(input: SalonPricingInput): PricingResult {
  const {
    mattressLength,
    mattressCount,
    cornerCount,
    armCount = DEFAULT_ARM_COUNT,
    thicknessMultiplier = 100,
    fabricPricePerMeter = 0,
    hasSmallTable = false,
    hasBigTable = false,
    needsDelivery = false,
    deliveryLocation = "",
  } = input;

  const breakdown: PricingResult["breakdown"] = {};

  // Prix des matelas
  const mattressPrice = calculateMattressPrice(mattressLength, thicknessMultiplier);
  breakdown.mattresses = mattressPrice * mattressCount;

  // Prix des coins
  const cornerPrice = calculateCornerPrice(thicknessMultiplier);
  breakdown.corners = cornerPrice * cornerCount;

  // Prix des bras
  breakdown.arms = ARM_PRICE_EACH * armCount;

  // Prix des tables
  if (hasSmallTable) {
    breakdown.smallTable = SMALL_TABLE_PRICE;
  }
  if (hasBigTable) {
    breakdown.bigTable = BIG_TABLE_PRICE;
  }

  // Transport fixe
  breakdown.transport = TRANSPORT_FEE;

  // Bénéfice fixe
  breakdown.profit = PROFIT_PER_SALON;

  // Calcul du sous-total
  const subtotal = Object.values(breakdown).reduce((sum, val) => sum + (val || 0), 0);

  // Frais de livraison
  let deliveryFee = 0;
  if (needsDelivery && deliveryLocation?.toLowerCase().includes("bamako")) {
    deliveryFee = DELIVERY_FEE_BAMAKO;
  }

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    breakdown,
  };
}

/**
 * Calcule le prix d'un tapis
 */
export function calculateCarpetPrice(input: CarpetPricingInput): PricingResult {
  const {
    length,
    width,
    needsDelivery = false,
    deliveryLocation = "",
  } = input;

  const breakdown: PricingResult["breakdown"] = {};

  // Prix du tapis : longueur x largeur x prix par mètre carré
  breakdown.carpet = Math.round(length * width * CARPET_PRICE_PER_SQM);

  const subtotal = breakdown.carpet;

  // Frais de livraison
  let deliveryFee = 0;
  if (needsDelivery && deliveryLocation?.toLowerCase().includes("bamako")) {
    deliveryFee = DELIVERY_FEE_BAMAKO;
  }

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    breakdown,
  };
}

/**
 * Calcule le prix d'un rideau
 */
export function calculateCurtainPrice(input: CurtainPricingInput): PricingResult {
  const {
    length,
    width,
    quality,
    needsDelivery = false,
    deliveryLocation = "",
  } = input;

  const breakdown: PricingResult["breakdown"] = {};

  // Prix du rideau : longueur x largeur x prix par mètre carré selon la qualité
  const pricePerSqm = CURTAIN_PRICES[quality];
  breakdown.carpet = Math.round(length * width * pricePerSqm); // Réutilise le champ carpet pour les rideaux

  const subtotal = breakdown.carpet;

  // Frais de livraison
  let deliveryFee = 0;
  if (needsDelivery && deliveryLocation?.toLowerCase().includes("bamako")) {
    deliveryFee = DELIVERY_FEE_BAMAKO;
  }

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    breakdown,
  };
}

/**
 * Formate un montant en FCFA
 */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

