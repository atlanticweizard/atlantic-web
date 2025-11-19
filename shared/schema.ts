import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  stock: integer("stock").notNull().default(10),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerInfo: jsonb("customer_info").notNull().$type<CheckoutData>(),
  items: jsonb("items").notNull().$type<CartItem[]>(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().$type<string>(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  userId: integer("user_id"),
  paymentStatus: text("payment_status").$type<"pending" | "success" | "failed">().default("pending"),
  transactionId: text("transaction_id"),
  payuResponse: jsonb("payu_response"),
  paymentMethod: text("payment_method"),
});

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PublicUser = Omit<User, "password">;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
