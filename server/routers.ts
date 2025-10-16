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

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ========== CATEGORIES ==========
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = nanoid();
        await db.createCategory({ id, ...input });
        return { id };
      }),
  }),

  // ========== PRODUCTS ==========
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
    
    create: adminProcedure
      .input(z.object({
        categoryId: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        basePrice: z.number(),
      }))
      .mutation(async ({ input }) => {
        const id = nanoid();
        await db.createProduct({ id, ...input });
        return { id };
      }),
  }),

  // ========== FABRIC OPTIONS ==========
  fabrics: router({
    list: publicProcedure.query(async () => {
      return await db.getAllFabricOptions();
    }),
    
    default: publicProcedure.query(async () => {
      return await db.getDefaultFabric();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        pricePerMeter: z.number(),
        imageUrl: z.string().optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = nanoid();
        await db.createFabricOption({ id, ...input });
        return { id };
      }),
  }),

  // ========== THICKNESS OPTIONS ==========
  thickness: router({
    list: publicProcedure.query(async () => {
      return await db.getAllThicknessOptions();
    }),
    
    default: publicProcedure.query(async () => {
      return await db.getDefaultThickness();
    }),
    
    create: adminProcedure
      .input(z.object({
        thickness: z.number(),
        priceMultiplier: z.number(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = nanoid();
        await db.createThicknessOption({ id, ...input });
        return { id };
      }),
  }),

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
        const quote = await db.getQuoteById(input.id);
        if (!quote) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Devis non trouvé' });
        }
        const items = await db.getQuoteItems(input.id);
        return { quote, items };
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
          mattressLength: z.number().optional(),
          mattressCount: z.number().optional(),
          cornerCount: z.number().optional(),
          armCount: z.number().optional(),
          fabricId: z.string().optional(),
          fabricName: z.string().optional(),
          thicknessId: z.string().optional(),
          thickness: z.number().optional(),
          hasSmallTable: z.boolean().optional(),
          hasBigTable: z.boolean().optional(),
          // Carpet/rug fields
          length: z.number().optional(),
          width: z.number().optional(),
          // Delivery
          needsDelivery: z.boolean().optional(),
          deliveryLocation: z.string().optional(),
          // Pricing
          unitPrice: z.number(),
          quantity: z.number().default(1),
          subtotal: z.number(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const quoteId = nanoid();
        
        // Calcul du montant total
        const totalAmount = input.items.reduce((sum, item) => sum + item.subtotal, 0);
        
        // Créer le devis
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
        
        // Créer les lignes de devis
        const quoteItemsData = input.items.map(item => ({
          id: nanoid(),
          quoteId,
          ...item,
        }));
        
        await db.createQuoteItems(quoteItemsData);
        
        return { quoteId };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(["pending", "validated", "rejected", "converted"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateQuoteStatus(input.id, input.status, ctx.user.id);
        return { success: true };
      }),
    
    updateAdminNotes: adminProcedure
      .input(z.object({
        id: z.string(),
        adminNotes: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateQuoteAdminNotes(input.id, input.adminNotes);
        return { success: true };
      }),
  }),

  // ========== PRICING CALCULATOR ==========
  pricing: router({
    calculateSalon: publicProcedure
      .input(z.object({
        mattressLength: z.number().min(1).max(240),
        mattressCount: z.number().min(1),
        cornerCount: z.number().min(0),
        armCount: z.number().min(0).optional(),
        thicknessMultiplier: z.number().optional(),
        fabricPricePerMeter: z.number().optional(),
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
        length: z.number().min(0.1),
        width: z.number().min(0.1),
        needsDelivery: z.boolean().optional(),
        deliveryLocation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return calculateCarpetPrice(input);
      }),
    
    calculateCurtain: publicProcedure
      .input(z.object({
        length: z.number().min(0.1),
        width: z.number().min(0.1),
        quality: z.enum(["dubai", "quality2", "quality3"]),
        needsDelivery: z.boolean().optional(),
        deliveryLocation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return calculateCurtainPrice(input);
      }),
  }),

  // ========== ORDERS ==========
  orders: router({
    list: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Commande non trouvée' });
        }
        return order;
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

