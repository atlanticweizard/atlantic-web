import { db } from "./db";
import { products, admins } from "@shared/schema";
import { sql } from "drizzle-orm";

const seedProducts = [
  {
    name: "Heritage Cashmere Overcoat",
    description: "An impeccably crafted overcoat in the finest Italian cashmere. Features a timeless silhouette with peak lapels, hand-stitched details, and a luxurious drape that commands attention. Perfect for the discerning gentleman who appreciates understated elegance.",
    price: "2499.00",
    category: "Outerwear",
    image: "/assets/products/Black_cashmere_luxury_overcoat_85411d0a.png",
    stock: 8,
  },
  {
    name: "Pure Silk Dress Shirt",
    description: "Elevate your wardrobe with this exceptional dress shirt crafted from 100% mulberry silk. Features mother-of-pearl buttons, French cuffs, and a tailored fit that embodies sophistication. A versatile piece that transitions seamlessly from boardroom to evening events.",
    price: "495.00",
    category: "Shirts",
    image: "/assets/products/White_silk_dress_shirt_2dcfc9eb.png",
    stock: 15,
  },
  {
    name: "Tailored Wool Blazer",
    description: "A masterpiece of tailoring in premium charcoal wool. This blazer features hand-padded shoulders, working cuff buttons, and a half-canvas construction that ensures perfect drape and structure. The epitome of modern classic menswear.",
    price: "1899.00",
    category: "Outerwear",
    image: "/assets/products/Charcoal_tailored_wool_blazer_2de5467b.png",
    stock: 10,
  },
  {
    name: "Oxford Leather Dress Shoes",
    description: "Handcrafted in Italy from the finest calfskin leather, these Oxford shoes feature Goodyear welt construction, leather soles, and subtle gold accents. A timeless design that will serve you for decades with proper care.",
    price: "899.00",
    category: "Footwear",
    image: "/assets/products/Black_leather_oxford_shoes_d9b0f624.png",
    stock: 12,
  },
  {
    name: "Prestige Gold Timepiece",
    description: "An exquisite automatic watch featuring a 42mm gold-plated case, sapphire crystal, and genuine leather strap. This timepiece combines Swiss precision with timeless design, making it the perfect finishing touch to any refined ensemble.",
    price: "3499.00",
    category: "Accessories",
    image: "/assets/products/Gold_luxury_wristwatch_6ea8d976.png",
    stock: 5,
  },
  {
    name: "Merino Wool Turtleneck",
    description: "Luxurious softness meets impeccable style in this navy turtleneck, knitted from superfine merino wool. The perfect layering piece that offers both warmth and sophistication, ideal for creating effortlessly elegant looks.",
    price: "425.00",
    category: "Knitwear",
    image: "/assets/products/Navy_merino_turtleneck_sweater_0e1f12c8.png",
    stock: 20,
  },
  {
    name: "Tailored Dress Trousers",
    description: "These impeccably tailored trousers in premium Italian wool feature a slim fit, side adjusters, and hand-finished details. The perfect foundation for any refined wardrobe, offering comfort without compromising on style.",
    price: "595.00",
    category: "Trousers",
    image: "/assets/products/Black_tailored_trousers_197300a8.png",
    stock: 18,
  },
  {
    name: "Cashmere Scarf",
    description: "Crafted from the finest Mongolian cashmere, this scarf offers unparalleled softness and warmth. Its neutral cream tone complements any outfit, while the generous dimensions allow for various styling options.",
    price: "385.00",
    category: "Accessories",
    image: "/assets/products/Cream_cashmere_scarf_24ba90da.png",
    stock: 25,
  },
  {
    name: "Executive Leather Briefcase",
    description: "A distinguished briefcase handcrafted from full-grain leather with gold-plated hardware. Features multiple compartments, a padded laptop sleeve, and will develop a rich patina over time. The perfect companion for the modern professional.",
    price: "1299.00",
    category: "Accessories",
    image: "/assets/products/Black_leather_briefcase_4df0c237.png",
    stock: 7,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    console.log("📦 Checking if products already exist...");
    const existingProducts = await db.select().from(products);
    
    if (existingProducts.length === 0) {
      console.log("📦 Inserting products...");
      await db.insert(products).values(seedProducts);
      console.log("✅ Products seeded successfully");
    } else {
      console.log("⏭️  Products already exist, skipping");
    }

    console.log("👤 Checking if admin exists...");
    const existingAdmin = await db.select().from(admins).where(sql`${admins.email} = 'admin@atlantic.com'`);
    
    if (existingAdmin.length === 0) {
      console.log("👤 Creating admin account...");
      await db.insert(admins).values({
        email: "admin@atlantic.com",
        password: "admin123",
      });
      console.log("✅ Admin created successfully");
    } else {
      console.log("⏭️  Admin already exists, skipping");
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
