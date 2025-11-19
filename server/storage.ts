import { type Product, type InsertProduct, type Admin, type InsertAdmin, type Order, type InsertOrder, type User, type InsertUser } from "@shared/schema";
import session from "express-session";

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  updateOrderPayment(id: string, paymentData: { paymentStatus: string; transactionId: string; payuResponse: any; paymentMethod?: string }): Promise<Order | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserOrders(userId: number): Promise<Order[]>;
  sessionStore: session.Store;
}

if (!process.env.DATABASE_URL) {
  console.error("\n❌ ERROR: DATABASE_URL environment variable is required");
  console.error("This application requires PostgreSQL to run.");
  console.error("\nTo set up the database:");
  console.error("1. Install PostgreSQL on your server");
  console.error("2. Create a database for the application");
  console.error("3. Set DATABASE_URL in your environment variables");
  console.error("   Example: DATABASE_URL=postgresql://user:password@localhost:5432/atlantic_weizard");
  console.error("\nFor deployment instructions, see DEPLOYMENT.md\n");
  process.exit(1);
}

console.log("🔍 Connecting to PostgreSQL...");

import { PostgresStorage } from "./storage-pg.js";

export const storage = new PostgresStorage();

console.log("✅ PostgreSQL storage initialized");
