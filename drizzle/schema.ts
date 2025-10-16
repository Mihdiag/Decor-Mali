import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Catégories de produits
 */
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Produits (salons, tapis, rideaux, moquettes, etc.)
 */
export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  categoryId: varchar("categoryId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  basePrice: int("basePrice").notNull(), // Prix de base en FCFA
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Options de tissus pour les salons
 */
export const fabricOptions = mysqlTable("fabricOptions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pricePerMeter: int("pricePerMeter").notNull(), // Prix par mètre en FCFA
  imageUrl: text("imageUrl"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type FabricOption = typeof fabricOptions.$inferSelect;
export type InsertFabricOption = typeof fabricOptions.$inferInsert;

/**
 * Options d'épaisseur pour les matelas
 */
export const thicknessOptions = mysqlTable("thicknessOptions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  thickness: int("thickness").notNull(), // Épaisseur en cm
  priceMultiplier: int("priceMultiplier").notNull(), // Multiplicateur de prix en pourcentage (100 = prix normal)
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ThicknessOption = typeof thicknessOptions.$inferSelect;
export type InsertThicknessOption = typeof thicknessOptions.$inferInsert;

/**
 * Devis créés par les clients
 */
export const quotes = mysqlTable("quotes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 50 }).notNull(),
  customerAddress: text("customerAddress"),
  status: mysqlEnum("status", ["pending", "validated", "rejected", "converted"]).default("pending").notNull(),
  totalAmount: int("totalAmount").notNull(), // Montant total en FCFA
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  validatedAt: timestamp("validatedAt"),
  validatedBy: varchar("validatedBy", { length: 64 }),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Lignes de devis (détails des produits dans un devis)
 */
export const quoteItems = mysqlTable("quoteItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  quoteId: varchar("quoteId", { length: 64 }).notNull(),
  productType: mysqlEnum("productType", ["salon", "tapis", "rideau", "moquette", "accessoire"]).notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  
  // Pour les salons
  mattressLength: int("mattressLength"), // Longueur en cm
  mattressCount: int("mattressCount"), // Nombre de matelas
  cornerCount: int("cornerCount"), // Nombre de coins
  armCount: int("armCount"), // Nombre de bras
  fabricId: varchar("fabricId", { length: 64 }),
  fabricName: varchar("fabricName", { length: 255 }),
  thicknessId: varchar("thicknessId", { length: 64 }),
  thickness: int("thickness"), // Épaisseur en cm
  hasSmallTable: boolean("hasSmallTable").default(false),
  hasBigTable: boolean("hasBigTable").default(false),
  
  // Pour les tapis et moquettes
  length: int("length"), // Longueur en mètres
  width: int("width"), // Largeur en mètres
  
  // Livraison
  needsDelivery: boolean("needsDelivery").default(false),
  deliveryLocation: varchar("deliveryLocation", { length: 255 }),
  
  unitPrice: int("unitPrice").notNull(), // Prix unitaire en FCFA
  quantity: int("quantity").default(1).notNull(),
  subtotal: int("subtotal").notNull(), // Sous-total en FCFA
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = typeof quoteItems.$inferInsert;

/**
 * Commandes confirmées
 */
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  quoteId: varchar("quoteId", { length: 64 }),
  userId: varchar("userId", { length: 64 }),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 50 }).notNull(),
  customerAddress: text("customerAddress"),
  status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  totalAmount: int("totalAmount").notNull(),
  paidAmount: int("paidAmount").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

