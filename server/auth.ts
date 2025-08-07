import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { AdminUser, LoginRequest } from "@shared/schema";

export class AuthService {
  private static SALT_ROUNDS = 12;
  private static SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate session token
  static generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Login admin user
  static async loginAdmin(credentials: LoginRequest): Promise<{ admin: AdminUser; sessionToken: string } | null> {
    try {
      // Find admin user by username
      const admin = await storage.getAdminByUsername(credentials.username);
      if (!admin || !admin.isActive) {
        return null;
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, admin.password);
      if (!isValidPassword) {
        return null;
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);
      
      await storage.createAdminSession({
        adminId: admin.id,
        sessionToken,
        expiresAt
      });

      // Update last login time
      await storage.updateAdminLastLogin(admin.id);

      return {
        admin: { ...admin, password: "" }, // Don't return password
        sessionToken
      };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  // Verify session token
  static async verifySession(sessionToken: string): Promise<AdminUser | null> {
    try {
      const session = await storage.getAdminSession(sessionToken);
      if (!session || session.expiresAt < new Date()) {
        // Clean up expired session
        if (session) {
          await storage.deleteAdminSession(sessionToken);
        }
        return null;
      }

      const admin = await storage.getAdminById(session.adminId);
      if (!admin || !admin.isActive) {
        await storage.deleteAdminSession(sessionToken);
        return null;
      }

      return { ...admin, password: "" }; // Don't return password
    } catch (error) {
      console.error("Session verification error:", error);
      return null;
    }
  }

  // Logout (delete session)
  static async logout(sessionToken: string): Promise<boolean> {
    try {
      await storage.deleteAdminSession(sessionToken);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  // Create default admin user if not exists
  static async createDefaultAdmin(): Promise<void> {
    try {
      const existingAdmin = await storage.getAdminByUsername("admin");
      if (!existingAdmin) {
        const hashedPassword = await this.hashPassword("admin123");
        await storage.createAdminUser({
          username: "admin",
          password: hashedPassword,
          fullName: "Administrator",
          role: "admin"
        });
        console.log("Default admin user created: username=admin, password=admin123");
      }
    } catch (error) {
      console.error("Error creating default admin:", error);
    }
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      admin?: any;
    }
  }
}

// Middleware to check authentication
export function requireAuth(req: any, res: any, next: any) {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.sessionToken;
  
  if (!sessionToken) {
    return res.status(401).json({ error: "Session token majburiy" });
  }

  AuthService.verifySession(sessionToken)
    .then(admin => {
      if (!admin) {
        return res.status(401).json({ error: "Yaroqsiz yoki eskirgan session" });
      }
      req.admin = admin;
      next();
    })
    .catch(error => {
      console.error("Auth middleware error:", error);
      res.status(500).json({ error: "Authentication xatosi" });
    });
}