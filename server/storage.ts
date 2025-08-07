import { 
  users, products, orders, conversations, botSettings, adminUsers, adminSessions,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Conversation, type InsertConversation,
  type BotSettings, type InsertBotSettings,
  type AdminUser, type InsertAdminUser,
  type AdminSession
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
}

export const storage = new DatabaseStorage();
