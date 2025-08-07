import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertUserSchema, loginSchema, insertTranslationSchema, insertCategorySchema } from "@shared/schema";
import { telegramBot } from "./services/telegram-bot";
import { MarketingScheduler } from "./services/marketing-scheduler";
import { AuthService, requireAuth } from "./auth";

// Global marketing scheduler instance
let marketingScheduler: MarketingScheduler | null = null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin user
  await AuthService.createDefaultAdmin();

  // Auth Routes (Public)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.loginAdmin(validatedData);
      
      if (!result) {
        return res.status(401).json({ error: "Username yoki parol noto'g'ri" });
      }

      // Set cookie for browser
      res.cookie('sessionToken', result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
      });

      res.json({ 
        success: true, 
        admin: result.admin,
        sessionToken: result.sessionToken
      });
    } catch (error) {
      res.status(400).json({ error: "Kiritilgan ma'lumotlar noto'g'ri" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const sessionToken = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.sessionToken;
    
    if (sessionToken) {
      await AuthService.logout(sessionToken);
    }

    res.clearCookie('sessionToken');
    res.json({ success: true });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    res.json(req.admin);
  });

  // Dashboard Stats (Protected)
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
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
      console.log('Raw request body:', req.body);
      
      // z.coerce will automatically handle string to number conversion
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      console.log('Raw update request body:', req.body);
      
      // z.coerce will automatically handle string to number conversion
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error('Product update error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product data" });
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

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('Categories fetch error:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      console.log('Raw category request body:', req.body);
      
      const processedData = {
        ...req.body,
        sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder) : 0,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };
      
      console.log('Processed category data:', processedData);
      
      const validatedData = insertCategorySchema.parse(processedData);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Category creation error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      console.log('Raw category update request body:', req.body);
      
      const processedData = {
        ...req.body,
        sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder) : undefined,
        isActive: req.body.isActive !== undefined ? req.body.isActive : undefined
      };
      
      Object.keys(processedData).forEach(key => 
        processedData[key] === undefined && delete processedData[key]
      );
      
      console.log('Processed category update data:', processedData);
      
      const validatedData = insertCategorySchema.partial().parse(processedData);
      const category = await storage.updateCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error('Category update error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Marketing endpoints
  app.get("/api/marketing/messages", async (req, res) => {
    try {
      // Return default marketing messages for now
      const messages = [
        {
          id: 'default-1',
          titleUz: '🎉 Yangi Chegirmalar!',
          titleRu: '🎉 Новые Скидки!',
          contentUz: `🛍️ Hurmatli mijoz!\n\n🎊 Bizda yangi chegirmalar boshlandi!\n💫 20% gacha chegirma barcha mahsulotlarga\n⏰ Muddat: 3 kun\n\n📦 Katalogni ko'rish uchun tugmani bosing!`,
          contentRu: `🛍️ Уважаемый клиент!\n\n🎊 У нас началась новая акция!\n💫 Скидки до 20% на все товары\n⏰ Срок: 3 дня\n\n📦 Нажмите кнопку для просмотра каталога!`,
          isActive: true,
          intervalDays: 2,
          createdAt: new Date().toISOString(),
          lastSentAt: undefined
        },
        {
          id: 'default-2',
          titleUz: '🚚 Bepul Yetkazib Berish!',
          titleRu: '🚚 Бесплатная Доставка!',
          contentUz: `🎁 Ajoyib yangilik!\n\n🚚 100,000 so'mdan yuqori buyurtmalarga bepul yetkazib berish!\n📍 Butun O'zbekiston bo'ylab\n⚡ Tez va ishonchli\n\n🛒 Hoziroq buyurtma bering!`,
          contentRu: `🎁 Отличные новости!\n\n🚚 Бесплатная доставка при заказе от 100,000 сум!\n📍 По всему Узбекистану\n⚡ Быстро и надежно\n\n🛒 Заказывайте прямо сейчас!`,
          isActive: false,
          intervalDays: 2,
          createdAt: new Date().toISOString(),
          lastSentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        }
      ];
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marketing messages" });
    }
  });

  app.post("/api/marketing/messages", async (req, res) => {
    try {
      // For now, just return a success response
      // In a real implementation, you'd save to database
      const newMessage = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to create marketing message" });
    }
  });

  app.put("/api/marketing/messages/:id", async (req, res) => {
    try {
      // For now, just return success
      const updatedMessage = {
        id: req.params.id,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to update marketing message" });
    }
  });

  app.post("/api/marketing/send-now/:id", async (req, res) => {
    try {
      if (!marketingScheduler) {
        return res.status(400).json({ error: "Marketing scheduler not initialized" });
      }
      
      const result = await marketingScheduler.sendMarketingMessageNow(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to send marketing message" });
    }
  });

  // Initialize marketing scheduler when bot is ready
  if (telegramBot) {
    marketingScheduler = new MarketingScheduler(telegramBot);
    marketingScheduler.startScheduler();
    console.log("Marketing scheduler initialized and started");
  }

  // Translations Routes (Protected)
  app.get("/api/translations", requireAuth, async (req, res) => {
    try {
      const translations = await storage.getAllTranslations();
      res.json(translations);
    } catch (error) {
      res.status(500).json({ error: "Tarjimalarni olishda xatolik" });
    }
  });

  app.get("/api/translations/:id", requireAuth, async (req, res) => {
    try {
      const translation = await storage.getTranslation(req.params.id);
      if (!translation) {
        return res.status(404).json({ error: "Tarjima topilmadi" });
      }
      res.json(translation);
    } catch (error) {
      res.status(500).json({ error: "Tarjimani olishda xatolik" });
    }
  });

  app.post("/api/translations", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTranslationSchema.parse(req.body);
      
      // Check if key already exists
      const existing = await storage.getTranslationByKey(validatedData.key);
      if (existing) {
        return res.status(400).json({ error: "Bu kalit allaqachon mavjud" });
      }

      const translation = await storage.createTranslation(validatedData);
      res.status(201).json(translation);
    } catch (error) {
      res.status(400).json({ error: "Tarjima yaratishda xatolik" });
    }
  });

  app.put("/api/translations/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTranslationSchema.partial().parse(req.body);
      const translation = await storage.updateTranslation(req.params.id, validatedData);
      
      if (!translation) {
        return res.status(404).json({ error: "Tarjima topilmadi" });
      }
      
      res.json(translation);
    } catch (error) {
      res.status(400).json({ error: "Tarjimani yangilashda xatolik" });
    }
  });

  app.delete("/api/translations/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTranslation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Tarjima topilmadi" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Tarjimani o'chirishda xatolik" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
