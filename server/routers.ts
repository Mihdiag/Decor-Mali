/* ==== extrait complet de ton routers (1).ts avec sections mises à jour ==== */
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { calculateSalonPrice, calculateCarpetPrice, calculateCurtainPrice } from "./pricing";
import { TRPCError } from "@trpc/server";

// Procédure admin uniquement
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' });
  }
  return next({ ctx });
});

// ==================== EXEMPLE (… autres routers non modifiés) ====================

export const appRouter = router({
  system: systemRouter,

  // ========== QUOTES ==========
  quotes: router({
    list: adminProcedure.query(async () => {
      return await db.getAllQuotes();
    }),
    
    byStatus: adminProcedure
      .input(z.object({ 
        status: z.enum(["pending", "validated", "rejected", "converted"]) 
      }))
      .query(async ({ input }) => {
        return await db.getQuotesByStatus(input.status);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getQuoteById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string(),
        customerAddress: z.string().optional(),
        notes: z.string().optional(),
        items: z.array(z.object({
          productType: z.enum(["salon", "tapis", "rideau", "moquette", "accessoire"]),
          productName: z.string(),
          // Salon fields
          mattressLength: z.coerce.number().optional(),
          mattressCount: z.coerce.number().optional(),
          cornerCount: z.coerce.number().optional(),
          armCount: z.coerce.number().optional(),
          fabricId: z.string().optional(),
          fabricName: z.string().optional(),
          thicknessId: z.string().optional(),
          thickness: z.coerce.number().optional(),
          hasSmallTable: z.boolean().optional(),
          hasBigTable: z.boolean().optional(),
          // Carpet/rug fields
          length: z.coerce.number().optional(),
          width: z.coerce.number().optional(),
          // Delivery
          needsDelivery: z.boolean().optional(),
          deliveryLocation: z.string().optional(),
          // Pricing
          unitPrice: z.coerce.number(),
          quantity: z.coerce.number().default(1),
          subtotal: z.coerce.number(),
          // Rideau
          quality: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const quoteId = nanoid();

        const totalAmount = input.items.reduce((acc, it) => acc + (it.subtotal ?? 0), 0);

        await db.createQuote({
          id: quoteId,
          userId: ctx.user?.id,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          notes: input.notes,
          totalAmount,
        });
        
        const quoteItemsData = input.items.map(item => ({
          id: nanoid(),
          quoteId,
          ...item,
        }));
        
        await db.createQuoteItems(quoteItemsData);
        return { id: quoteId };
      }),

    // … autres endpoints (update status, notes, etc.)
  }),

  // ========== PRICING CALCULATOR ==========
  pricing: router({
    calculateSalon: publicProcedure
      .input(z.object({
        mattressLength: z.coerce.number().min(1).max(240),
        mattressCount: z.coerce.number().min(1),
        cornerCount: z.coerce.number().min(0),
        armCount: z.coerce.number().min(0).optional(),
        thicknessMultiplier: z.coerce.number().optional(),
        fabricPricePerMeter: z.coerce.number().optional(),
        hasSmallTable: z.boolean().optional(),
        hasBigTable: z.boolean().optional(),
        needsDelivery: z.boolean().optional(),
        deliveryLocation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return calculateSalonPrice(input);
      }),
    
    calculateCarpet: publicProcedure
      .input(z.object({
        length: z.coerce.number().min(0.1),
        width: z.coerce.number().min(0.1),
        needsDelivery: z.boolean().optional(),
        deliveryLocation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return calculateCarpetPrice(input);
      }),

    calculateCurtain: publicProcedure
      .input(z.object({
        length: z.coerce.number().min(0.1),
        width: z.coerce.number().min(0.1),
        quality: z.enum(["dubai", "quality2", "quality3"]),
        needsDelivery: z.boolean().optional(),
        deliveryLocation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return calculateCurtainPrice(input);
      }),
  }),

  // ========== PRODUCTS ==========
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    // … le reste inchangé
  }),
});

export type AppRouter = typeof appRouter;
