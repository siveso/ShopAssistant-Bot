import { 
  users, products, orders, conversations, botSettings, adminUsers, adminSessions, translations, categories,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Conversation, type InsertConversation,
  type BotSettings, type InsertBotSettings,
  type AdminUser, type InsertAdminUser,
  type AdminSession,
  type Translation, type InsertTranslation,
  type Category, type InsertCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByPlatformId(platformId: string, platformType: "telegram" | "instagram"): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  searchProducts(query: string, language: "uz" | "ru"): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: "pending" | "processing" | "completed" | "cancelled"): Promise<Order | undefined>;
  updateOrder(id: string, insertOrder: Partial<InsertOrder>): Promise<Order | undefined>;

  // Conversations
  getConversation(userId: string, platformType: "telegram" | "instagram"): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationMessages(id: string, messages: any[]): Promise<Conversation | undefined>;

  // Bot Settings
  getBotSettings(): Promise<BotSettings | undefined>;
  updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings>;

  // Analytics
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeOrders: number;
    totalRevenue: number;
    messagesCount: number;
  }>;

  // Admin Users
  getAdminById(id: string): Promise<AdminUser | undefined>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(id: string): Promise<void>;

  // Admin Sessions
  createAdminSession(session: { adminId: string; sessionToken: string; expiresAt: Date }): Promise<AdminSession>;
  getAdminSession(sessionToken: string): Promise<AdminSession | undefined>;
  deleteAdminSession(sessionToken: string): Promise<void>;

  // Translations
  getAllTranslations(): Promise<Translation[]>;
  getTranslation(id: string): Promise<Translation | undefined>;
  getTranslationByKey(key: string): Promise<Translation | undefined>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(id: string, translation: Partial<InsertTranslation>): Promise<Translation | undefined>;
  deleteTranslation(id: string): Promise<boolean>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPlatformId(platformId: string, platformType: "telegram" | "instagram"): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.platformId, platformId), eq(users.platformType, platformType))
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, insertUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(insertUser).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async searchProducts(query: string, language: "uz" | "ru"): Promise<Product[]> {
    const nameField = language === "uz" ? products.nameUz : products.nameRu;
    const descField = language === "uz" ? products.descriptionUz : products.descriptionRu;
    
    return await db.select().from(products).where(
      and(
        eq(products.isActive, true),
        or(
          like(nameField, `%${query}%`),
          like(descField, `%${query}%`)
        )
      )
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, insertProduct: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(insertProduct).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const [product] = await db.update(products).set({ isActive: false }).where(eq(products.id, id)).returning();
    return !!product;
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: "pending" | "processing" | "completed" | "cancelled"): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  async updateOrder(id: string, insertOrder: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db.update(orders).set(insertOrder).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  // Conversations
  async getConversation(userId: string, platformType: "telegram" | "instagram"): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(
      and(eq(conversations.userId, userId), eq(conversations.platformType, platformType))
    );
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async updateConversationMessages(id: string, messages: any[]): Promise<Conversation | undefined> {
    const [conversation] = await db.update(conversations).set({ 
      messages,
      lastMessageAt: new Date()
    }).where(eq(conversations.id, id)).returning();
    return conversation || undefined;
  }

  // Bot Settings
  async getBotSettings(): Promise<BotSettings | undefined> {
    const [settings] = await db.select().from(botSettings).where(eq(botSettings.isActive, true));
    return settings || undefined;
  }

  async updateBotSettings(insertSettings: Partial<InsertBotSettings>): Promise<BotSettings> {
    const existing = await this.getBotSettings();
    
    if (existing) {
      const [settings] = await db.update(botSettings).set({
        ...insertSettings,
        updatedAt: new Date()
      }).where(eq(botSettings.id, existing.id)).returning();
      return settings;
    } else {
      const [settings] = await db.insert(botSettings).values({
        ...insertSettings,
        isActive: true
      }).returning();
      return settings;
    }
  }

  // Analytics
  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeOrders: number;
    totalRevenue: number;
    messagesCount: number;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [orderCount] = await db.select({ count: count() }).from(orders).where(
      or(eq(orders.orderStatus, "pending"), eq(orders.orderStatus, "processing"))
    );
    const [conversationCount] = await db.select({ count: count() }).from(conversations);
    
    // Calculate total revenue from completed orders
    const completedOrders = await db.select().from(orders).where(eq(orders.orderStatus, "completed"));
    const totalRevenue = completedOrders.reduce((sum, order) => {
      return sum + parseFloat(order.totalPrice?.toString() || "0");
    }, 0);

    return {
      totalUsers: userCount.count,
      activeOrders: orderCount.count,
      totalRevenue,
      messagesCount: conversationCount.count
    };
  }

  // Admin Users
  async getAdminById(id: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || undefined;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db.insert(adminUsers).values(insertAdmin).returning();
    return admin;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, id));
  }

  // Admin Sessions
  async createAdminSession(sessionData: { adminId: string; sessionToken: string; expiresAt: Date }): Promise<AdminSession> {
    const [session] = await db.insert(adminSessions).values(sessionData).returning();
    return session;
  }

  async getAdminSession(sessionToken: string): Promise<AdminSession | undefined> {
    const [session] = await db.select().from(adminSessions).where(eq(adminSessions.sessionToken, sessionToken));
    return session || undefined;
  }

  async deleteAdminSession(sessionToken: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.sessionToken, sessionToken));
  }

  // Translations
  async getAllTranslations(): Promise<Translation[]> {
    return await db.select().from(translations).orderBy(translations.category, translations.key);
  }

  async getTranslation(id: string): Promise<Translation | undefined> {
    const [translation] = await db.select().from(translations).where(eq(translations.id, id));
    return translation || undefined;
  }

  async getTranslationByKey(key: string): Promise<Translation | undefined> {
    const [translation] = await db.select().from(translations).where(eq(translations.key, key));
    return translation || undefined;
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const [newTranslation] = await db.insert(translations).values(translation).returning();
    return newTranslation;
  }

  async updateTranslation(id: string, translation: Partial<InsertTranslation>): Promise<Translation | undefined> {
    const [updated] = await db.update(translations)
      .set({ ...translation, updatedAt: new Date() })
      .where(eq(translations.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTranslation(id: string): Promise<boolean> {
    const result = await db.delete(translations).where(eq(translations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder, desc(categories.createdAt));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: string, insertCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(insertCategory).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

// Fallback storage for when database is not available
class FallbackStorage implements IStorage {
  private adminUser = {
    id: "admin-id",
    username: "admin", 
    password: "$2b$12$TtSA6npfGeSMWsBKZguPTeJNcRcMRifQkIB0XnbSC/0xaeCkQEFf.", // admin123 hashed
    fullName: "Administrator",
    role: "admin" as const,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date()
  };
  
  private sessions: Map<string, AdminSession> = new Map();

  // Admin methods that work in fallback mode
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    if (username === "admin") {
      return this.adminUser;
    }
    return undefined;
  }

  async getAdminById(id: string): Promise<AdminUser | undefined> {
    if (id === "admin-id") {
      return this.adminUser;
    }
    return undefined;
  }

  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    console.log("Fallback: Admin user already exists");
    return this.adminUser;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    console.log("Fallback: Last login updated");
  }

  async createAdminSession(sessionData: { adminId: string; sessionToken: string; expiresAt: Date }): Promise<AdminSession> {
    const session = {
      id: "session-" + Date.now(),
      ...sessionData,
      createdAt: new Date()
    };
    console.log(`Fallback: Creating session with token: ${sessionData.sessionToken}`);
    this.sessions.set(sessionData.sessionToken, session);
    console.log(`Fallback: Session created. Total sessions: ${this.sessions.size}`);
    return session;
  }

  async getAdminSession(sessionToken: string): Promise<AdminSession | undefined> {
    console.log(`Fallback: Looking for session token: ${sessionToken}`);
    console.log(`Fallback: Available sessions:`, Array.from(this.sessions.keys()));
    return this.sessions.get(sessionToken);
  }

  async deleteAdminSession(sessionToken: string): Promise<void> {
    this.sessions.delete(sessionToken);
  }

  // All other methods return empty/default data
  async getUser(id: string): Promise<User | undefined> { return undefined; }
  async getUserByPlatformId(platformId: string, platformType: "telegram" | "instagram"): Promise<User | undefined> { return undefined; }
  async createUser(user: InsertUser): Promise<User> {
    return {
      id: "user-1",
      platformId: user.platformId,
      platformType: user.platformType,
      fullName: user.fullName || null,
      phoneNumber: user.phoneNumber || null,
      languageCode: user.languageCode || null,
      createdAt: new Date()
    };
  }
  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> { return undefined; }
  async getAllUsers(): Promise<User[]> { return []; }
  async getProduct(id: string): Promise<Product | undefined> { return undefined; }
  async getAllProducts(): Promise<Product[]> { return []; }
  async searchProducts(query: string, language: "uz" | "ru"): Promise<Product[]> { return []; }
  async createProduct(product: InsertProduct): Promise<Product> {
    return {
      id: "product-1",
      nameUz: product.nameUz,
      nameRu: product.nameRu,
      descriptionUz: product.descriptionUz || null,
      descriptionRu: product.descriptionRu || null,
      price: product.price,
      stockQuantity: product.stockQuantity || null,
      imageUrl: product.imageUrl || null,
      category: product.category || null,
      isActive: product.isActive || null,
      createdAt: new Date()
    };
  }
  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> { return undefined; }
  async deleteProduct(id: string): Promise<boolean> { return false; }
  async getOrder(id: string): Promise<Order | undefined> { return undefined; }
  async getOrdersByUser(userId: string): Promise<Order[]> { return []; }
  async getAllOrders(): Promise<Order[]> { return []; }
  async createOrder(order: InsertOrder): Promise<Order> {
    return {
      id: "order-1",
      userId: order.userId,
      productId: order.productId,
      quantity: order.quantity || null,
      totalPrice: order.totalPrice || null,
      orderStatus: order.orderStatus || null,
      createdAt: new Date()
    };
  }
  async updateOrderStatus(id: string, status: "pending" | "processing" | "completed" | "cancelled"): Promise<Order | undefined> { return undefined; }
  async getConversation(userId: string, platformType: "telegram" | "instagram"): Promise<Conversation | undefined> { return undefined; }
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    return {
      id: "conv-1",
      userId: conversation.userId,
      platformType: conversation.platformType,
      messages: conversation.messages || [],
      isActive: conversation.isActive || null,
      lastMessageAt: new Date(),
      createdAt: new Date()
    };
  }
  async updateConversationMessages(id: string, messages: any[]): Promise<Conversation | undefined> { return undefined; }
  async getBotSettings(): Promise<BotSettings | undefined> { return undefined; }
  async updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings> {
    return {
      id: "settings-1",
      telegramBotToken: settings.telegramBotToken || null,
      instagramAccessToken: settings.instagramAccessToken || null,
      geminiApiKey: settings.geminiApiKey || null,
      companyName: settings.companyName || null,
      companyDescriptionUz: settings.companyDescriptionUz || null,
      companyDescriptionRu: settings.companyDescriptionRu || null,
      companyAddress: settings.companyAddress || null,
      workingHours: settings.workingHours || null,
      website: settings.website || null,
      email: settings.email || null,
      contactInfo: settings.contactInfo || null,
      operatorPhone: settings.operatorPhone || null,
      isActive: true,
      ruleBasedResponses: settings.ruleBasedResponses || {},
      updatedAt: new Date()
    };
  }

  // Translations for fallback storage
  async getAllTranslations(): Promise<Translation[]> {
    // Return mock translations for demo
    return [
      {
        id: "trans-1",
        key: "welcome_message",
        uz: "Assalomu alaykum! Bizning online do'konimizga xush kelibsiz!",
        ru: "Здравствуйте! Добро пожаловать в наш интернет-магазин!",
        category: "bot",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "trans-2", 
        key: "catalog_button",
        uz: "📦 Katalog",
        ru: "📦 Каталог",
        category: "bot",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async getTranslation(id: string): Promise<Translation | undefined> {
    const translations = await this.getAllTranslations();
    return translations.find(t => t.id === id);
  }

  async getTranslationByKey(key: string): Promise<Translation | undefined> {
    const translations = await this.getAllTranslations();
    return translations.find(t => t.key === key);
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    return {
      id: "new-trans-" + Date.now(),
      ...translation,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateTranslation(id: string, translation: Partial<InsertTranslation>): Promise<Translation | undefined> {
    return {
      id,
      key: translation.key || "updated_key",
      uz: translation.uz || "Updated UZ",
      ru: translation.ru || "Updated RU", 
      category: translation.category || "bot",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async deleteTranslation(id: string): Promise<boolean> {
    return true;
  }

  // Categories for fallback storage
  async getAllCategories(): Promise<Category[]> {
    return [
      {
        id: "cat-1",
        nameUz: "Elektronika",
        nameRu: "Электроника",
        descriptionUz: "Elektron va raqamli mahsulotlar",
        descriptionRu: "Электронные и цифровые товары",
        imageUrl: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
      },
      {
        id: "cat-2",
        nameUz: "Kiyim-kechak",
        nameRu: "Одежда",
        descriptionUz: "Kiyim va aksessuarlar",
        descriptionRu: "Одежда и аксессуары",
        imageUrl: null,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
      }
    ];
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const categories = await this.getAllCategories();
    return categories.find(c => c.id === id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    return {
      id: "new-cat-" + Date.now(),
      ...category,
      createdAt: new Date(),
    };
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    return {
      id,
      nameUz: category.nameUz || "Updated UZ",
      nameRu: category.nameRu || "Updated RU",
      descriptionUz: category.descriptionUz || null,
      descriptionRu: category.descriptionRu || null,
      imageUrl: category.imageUrl || null,
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder || 0,
      createdAt: new Date(),
    };
  }

  async deleteCategory(id: string): Promise<boolean> {
    return true;
  }

  async getDashboardStats(): Promise<{ totalUsers: number; activeOrders: number; totalRevenue: number; messagesCount: number; }> {
    return { totalUsers: 0, activeOrders: 0, totalRevenue: 0, messagesCount: 0 };
  }
}

// Try to use database storage, fallback if it fails
function createStorage(): IStorage {
  try {
    // Check if we have a real database URL
    if (process.env.DATABASE_URL?.includes("placeholder") || !process.env.DATABASE_URL?.startsWith("postgresql://")) {
      console.log("📦 Using fallback storage (demo mode) - database not connected");
      return new FallbackStorage();
    }
    console.log("📦 Using database storage");
    return new DatabaseStorage();
  } catch (error) {
    console.log("📦 Database connection failed, using fallback storage (demo mode)");
    return new FallbackStorage();
  }
}

export const storage = createStorage();
