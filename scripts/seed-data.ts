import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import { fabricOptions, thicknessOptions, categories } from "../drizzle/schema";

async function seedData() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(fabricOptions);
  await db.delete(thicknessOptions);
  await db.delete(categories);

  // Seed fabric options
  console.log("Adding fabric options...");
  await db.insert(fabricOptions).values([
    {
      id: nanoid(),
      name: "Moutarras",
      pricePerMeter: 0, // Prix de base
      isDefault: true,
    },
    {
      id: nanoid(),
      name: "Brocart",
      pricePerMeter: 8000,
      isDefault: false,
    },
    {
      id: nanoid(),
      name: "Simple",
      pricePerMeter: 0,
      isDefault: false,
    },
  ]);

  // Seed thickness options - 30cm et 40cm uniquement
  console.log("Adding thickness options...");
  await db.insert(thicknessOptions).values([
    {
      id: nanoid(),
      thickness: 30,
      priceMultiplier: 100, // Prix normal
      isDefault: true,
    },
    {
      id: nanoid(),
      thickness: 40,
      priceMultiplier: 115, // +15% pour l'épaisseur supplémentaire
      isDefault: false,
    },
  ]);

  // Seed categories
  console.log("Adding categories...");
  await db.insert(categories).values([
    {
      id: nanoid(),
      name: "Salons Marocains",
      slug: "salons-marocains",
      description: "Salons marocains traditionnels et modernes sur mesure",
    },
    {
      id: nanoid(),
      name: "Salons Mauritaniens",
      slug: "salons-mauritaniens",
      description: "Salons mauritaniens élégants et confortables",
    },
    {
      id: nanoid(),
      name: "Tapis",
      slug: "tapis",
      description: "Large sélection de tapis de qualité - 13 000 FCFA/m²",
    },
    {
      id: nanoid(),
      name: "Rideaux",
      slug: "rideaux",
      description: "Rideaux sur mesure pour tous les espaces - 3 qualités disponibles",
    },
    {
      id: nanoid(),
      name: "Moquettes",
      slug: "moquettes",
      description: "Moquettes de qualité pour votre intérieur",
    },
  ]);

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seedData().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});

