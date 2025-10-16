import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  categories, 
  products, 
  fabricOptions, 
  thicknessOptions, 
  quotes, 
  quoteItems, 
  orders,
  InsertCategory,
  InsertProduct,
  InsertFabricOption,
  InsertThicknessOption,
  InsertQuote,
  InsertQuoteItem,
  InsertOrder
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== USERS ==========
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== CATEGORIES ==========
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories);
}

export async function getCategoryById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(categories).values(category);
}

// ========== PRODUCTS ==========
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.isActive, true));
}

export async function getProductsByCategory(categoryId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(eq(products.categoryId, categoryId));
}

export async function getProductById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(product);
}

// ========== FABRIC OPTIONS ==========
export async function getAllFabricOptions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(fabricOptions);
}

export async function getDefaultFabric() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(fabricOptions).where(eq(fabricOptions.isDefault, true)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFabricOption(fabric: InsertFabricOption) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(fabricOptions).values(fabric);
}

// ========== THICKNESS OPTIONS ==========
export async function getAllThicknessOptions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(thicknessOptions);
}

export async function getDefaultThickness() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(thicknessOptions).where(eq(thicknessOptions.isDefault, true)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createThicknessOption(thickness: InsertThicknessOption) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(thicknessOptions).values(thickness);
}

// ========== QUOTES ==========
export async function getAllQuotes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
}

export async function getQuotesByStatus(status: "pending" | "validated" | "rejected" | "converted") {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quotes).where(eq(quotes.status, status)).orderBy(desc(quotes.createdAt));
}

export async function getQuoteById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuote(quote: InsertQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quotes).values(quote);
  return quote.id;
}

export async function updateQuoteStatus(id: string, status: "pending" | "validated" | "rejected" | "converted", validatedBy?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };
  
  if (status === "validated" && validatedBy) {
    updateData.validatedAt = new Date();
    updateData.validatedBy = validatedBy;
  }
  
  await db.update(quotes).set(updateData).where(eq(quotes.id, id));
}

export async function updateQuoteAdminNotes(id: string, adminNotes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotes).set({ adminNotes, updatedAt: new Date() }).where(eq(quotes.id, id));
}

// ========== QUOTE ITEMS ==========
export async function getQuoteItems(quoteId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
}

export async function createQuoteItem(item: InsertQuoteItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quoteItems).values(item);
}

export async function createQuoteItems(items: InsertQuoteItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (items.length === 0) return;
  await db.insert(quoteItems).values(items);
}

// ========== ORDERS ==========
export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orders).values(order);
  return order.id;
}

export async function updateOrderStatus(id: string, status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };
  
  if (status === "completed") {
    updateData.completedAt = new Date();
  }
  
  await db.update(orders).set(updateData).where(eq(orders.id, id));
}

