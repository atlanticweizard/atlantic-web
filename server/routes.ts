import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { createPayUService } from "./payu";
import { emailService } from "./email";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const checkoutSchema = z.object({
  customerInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  items: z.array(z.object({
    product: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.string(),
      category: z.string(),
      image: z.string(),
      stock: z.number(),
    }),
    quantity: z.number(),
  })),
  total: z.number(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const admin = await storage.getAdminByEmail(email);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ success: true, admin: { id: admin.id, email: admin.email } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid login data" });
      }
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = checkoutSchema.parse(req.body);
      const orderData = {
        ...validatedData,
        total: validatedData.total.toString(),
        paymentStatus: "pending" as const,
      };
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/my", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userId = req.user!.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/payment/initiate", async (req, res) => {
    try {
      const { customerInfo, items } = req.body;
      
      console.log("🔍 Payment initiation request received");
      console.log("  - Customer:", customerInfo?.firstName, customerInfo?.lastName);
      console.log("  - Items count:", items?.length);
      
      if (!customerInfo || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid order data" });
      }

      let total = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await storage.getProductById(item.product.id);
        if (!product) {
          return res.status(400).json({ error: `Product ${item.product.id} not found` });
        }
        
        if (item.quantity <= 0 || item.quantity > product.stock) {
          return res.status(400).json({ error: `Invalid quantity for ${product.name}` });
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        total += itemTotal;
        
        validatedItems.push({
          product,
          quantity: item.quantity,
        });
      }
      
      const order = await storage.createOrder({
        customerInfo,
        items: validatedItems,
        total: total.toString(),
        paymentStatus: "pending",
      });

      console.log("✅ Order created:", order.id);

      // Initialize PayU service with error handling
      let payuService;
      try {
        payuService = createPayUService();
      } catch (error) {
        console.error("❌ PayU service initialization failed:", error);
        return res.status(500).json({ 
          error: "Payment gateway not configured. Please contact support.",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }

      const txnid = payuService.generateTransactionId();

      // Get base URL with proper fallback
      const replitDomain = process.env.REPLIT_DEV_DOMAIN;
      const baseUrl = process.env.NODE_ENV === "production" 
        ? "https://atlanticweizard.dpdns.org"
        : replitDomain 
          ? `https://${replitDomain}`
          : "http://localhost:5000"; // Fallback for local development
      
      console.log("🌐 Base URL for callbacks:", baseUrl);
      
      if (!replitDomain && process.env.NODE_ENV !== "production") {
        console.warn("⚠️  REPLIT_DEV_DOMAIN not set! Using fallback:", baseUrl);
      }

      const paymentData = {
        txnid,
        amount: total.toFixed(2),
        productinfo: `Order #${order.id.substring(0, 8)}`,
        firstname: customerInfo.firstName,
        lastname: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        surl: `${baseUrl}/api/payment/success`,
        furl: `${baseUrl}/api/payment/failure`,
        udf1: order.id,
      };

      const payuFormData = payuService.preparePaymentForm(paymentData);

      await storage.updateOrderPayment(order.id, {
        paymentStatus: "pending",
        transactionId: txnid,
        payuResponse: null,
      });

      const paymentUrl = payuService.getPaymentUrl();
      
      // Debug logging
      console.log("🔍 Payment initiation debug:");
      console.log("  - Payment URL:", paymentUrl);
      console.log("  - Order ID:", order.id);
      console.log("  - Transaction ID:", txnid);
      console.log("  - Total amount:", total.toFixed(2));
      console.log("  - Base URL:", baseUrl);
      console.log("  - Success URL:", paymentData.surl);
      console.log("  - Failure URL:", paymentData.furl);

      const response = {
        paymentUrl: paymentUrl,
        formData: payuFormData,
        orderId: order.id,
      };

      console.log("✅ Payment response being sent:", JSON.stringify(response, null, 2));
      
      res.json(response);
    } catch (error) {
      console.error("❌ Payment initiation error:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  });

  app.post("/api/payment/success", async (req, res) => {
    try {
      const {
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        status,
        hash,
        mihpayid,
        mode,
        udf1: orderId,
      } = req.body;

      if (!orderId || !txnid || !hash) {
        console.error("Missing required fields in payment callback");
        return res.redirect("/payment-failure?error=invalid_callback");
      }

      const order = await storage.getOrderById(orderId);
      if (!order) {
        console.error("Order not found:", orderId);
        return res.redirect("/payment-failure?error=order_not_found");
      }

      const payuService = createPayUService();
      
      const isValidHash = payuService.verifyHash(
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        status,
        hash,
        orderId
      );

      if (!isValidHash) {
        console.error("Hash verification failed for transaction:", txnid);
        await storage.updateOrderPayment(orderId, {
          paymentStatus: "failed",
          transactionId: txnid,
          payuResponse: { ...req.body, error: "hash_verification_failed" },
          paymentMethod: mode,
        });
        return res.redirect(`/payment-failure?orderId=${orderId}&error=invalid_hash`);
      }

      const expectedAmount = typeof order.total === "string" 
        ? parseFloat(order.total).toFixed(2) 
        : order.total.toFixed(2);
      if (amount !== expectedAmount) {
        console.error(`Amount mismatch: expected ${expectedAmount}, received ${amount}`);
        await storage.updateOrderPayment(orderId, {
          paymentStatus: "failed",
          transactionId: txnid,
          payuResponse: { ...req.body, error: "amount_mismatch" },
          paymentMethod: mode,
        });
        return res.redirect(`/payment-failure?orderId=${orderId}&error=amount_mismatch`);
      }

      if (status === "success") {
        await storage.updateOrderPayment(orderId, {
          paymentStatus: "success",
          transactionId: txnid,
          payuResponse: req.body,
          paymentMethod: mode,
        });

        const updatedOrder = await storage.getOrderById(orderId);
        if (updatedOrder) {
          emailService.sendPaymentSuccessEmail(updatedOrder).catch((err) => 
            console.error("Failed to send payment success email:", err)
          );
        }

        res.redirect(`/payment-success?orderId=${orderId}&txnid=${txnid}`);
      } else {
        await storage.updateOrderPayment(orderId, {
          paymentStatus: "failed",
          transactionId: txnid,
          payuResponse: req.body,
          paymentMethod: mode,
        });

        res.redirect(`/payment-failure?orderId=${orderId}&txnid=${txnid}`);
      }
    } catch (error) {
      console.error("Payment success callback error:", error);
      res.redirect("/payment-failure?error=processing_error");
    }
  });

  app.post("/api/payment/failure", async (req, res) => {
    try {
      const {
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        status,
        hash,
        mode,
        udf1: orderId,
      } = req.body;

      if (!orderId || !txnid) {
        console.error("Missing required fields in failure callback");
        return res.redirect("/payment-failure?error=invalid_callback");
      }

      const order = await storage.getOrderById(orderId);
      if (!order) {
        console.error("Order not found:", orderId);
        return res.redirect("/payment-failure?error=order_not_found");
      }

      const payuService = createPayUService();
      
      const isValidHash = payuService.verifyHash(
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        status,
        hash,
        orderId
      );

      if (!isValidHash) {
        console.error("Hash verification failed for transaction:", txnid);
      }

      await storage.updateOrderPayment(orderId, {
        paymentStatus: "failed",
        transactionId: txnid,
        payuResponse: req.body,
        paymentMethod: mode,
      });

      res.redirect(`/payment-failure?orderId=${orderId}&txnid=${txnid}`);
    } catch (error) {
      console.error("Payment failure callback error:", error);
      res.redirect("/payment-failure?error=processing_error");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
