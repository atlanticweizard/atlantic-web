import { type Product, type InsertProduct, type Admin, type InsertAdmin, type Order, type InsertOrder, type User, type InsertUser, products, admins, users, orders } from "@shared/schema";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";

const PgSession = ConnectPgSimple(session);

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

export class PostgresStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for PostgreSQL storage");
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.sessionStore = new PgSession({
      pool: pool as any,
      createTableIfMissing: true,
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, insertProduct: InsertProduct): Promise<Product | undefined> {
    const result = await db
      .update(products)
      .set(insertProduct)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.email, email));
    return result[0];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(insertOrder).returning();
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async updateOrderPayment(
    id: string,
    paymentData: { paymentStatus: string; transactionId: string; payuResponse: any; paymentMethod?: string }
  ): Promise<Order | undefined> {
    const result = await db
      .update(orders)
      .set({
        paymentStatus: paymentData.paymentStatus as "pending" | "success" | "failed",
        transactionId: paymentData.transactionId,
        payuResponse: paymentData.payuResponse,
        paymentMethod: paymentData.paymentMethod,
      })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
}

export const storage = new PostgresStorage();
