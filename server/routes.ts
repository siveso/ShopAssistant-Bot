import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertUserSchema } from "@shared/schema";
import { telegramBot } from "./services/telegram-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
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
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "processing", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Bot Settings
  app.get("/api/bot/settings", async (req, res) => {
    try {
      const settings = await storage.getBotSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot settings" });
    }
  });

  app.put("/api/bot/settings", async (req, res) => {
    try {
      const settings = await storage.updateBotSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot settings" });
    }
  });

  // Bot Status
  app.get("/api/bot/status", async (req, res) => {
    try {
      const isRunning = telegramBot.isRunning();
      res.json({ 
        status: isRunning ? "online" : "offline",
        telegram: isRunning,
        database: true,
        gemini: true
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot status" });
    }
  });

  app.post("/api/bot/restart", async (req, res) => {
    try {
      await telegramBot.restart();
      res.json({ success: true, message: "Bot restarted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to restart bot" });
    }
  });

  // Search products (for bot usage)
  app.get("/api/products/search", async (req, res) => {
    try {
      const { query, language = "uz" } = req.query;
      if (!query) {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
      const products = await storage.searchProducts(query.toString(), language as "uz" | "ru");
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
