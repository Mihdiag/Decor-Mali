/**
 * Routeur TRPC - Calculs de prix pour Décor Mali
 */

import { publicProcedure, router } from "../trpc";
import {
  calculateSalonPrice,
  calculateCarpetPrice,
  calculateCurtainPrice,
  type SalonPricingInput,
  type CarpetPricingInput,
  type CurtainPricingInput,
  type PricingResult,
} from "../../pricing";
import { z } from "zod";

// === Schémas de validation des entrées ===
const salonInputSchema = z.object({
  mattressLength: z.number(),
  mattressCount: z.number(),
  cornerCount: z.number(),
  armCount: z.number().optional(),
  thicknessMultiplier: z.number().optional(),
  fabricPricePerMeter: z.number().optional(),
  hasSmallTable: z.boolean().optional(),
  hasBigTable: z.boolean().optional(),
  needsDelivery: z.boolean().optional(),
  deliveryLocation: z.string().optional(),
});

const carpetInputSchema = z.object({
  length: z.number(),
  width: z.number(),
  needsDelivery: z.boolean().optional(),
  deliveryLocation: z.string().optional(),
});

const curtainInputSchema = z.object({
  length: z.number(),
  width: z.number(),
  quality: z.enum(["dubai", "quality2", "quality3"]),
  needsDelivery: z.boolean().optional(),
  deliveryLocation: z.string().optional(),
});

// === Routeur TRPC ===
export const pricingRouter = router({
  calculateSalon: publicProcedure
    .input(salonInputSchema)
    .mutation(async ({ input }): Promise<PricingResult> => {
      return calculateSalonPrice(input as SalonPricingInput);
    }),

  calculateCarpet: publicProcedure
    .input(carpetInputSchema)
    .mutation(async ({ input }): Promise<PricingResult> => {
      return calculateCarpetPrice(input as CarpetPricingInput);
    }),

  calculateCurtain: publicProcedure
    .input(curtainInputSchema)
    .mutation(async ({ input }): Promise<PricingResult> => {
      return calculateCurtainPrice(input as CurtainPricingInput);
    }),
});

export type PricingRouter = typeof pricingRouter;
